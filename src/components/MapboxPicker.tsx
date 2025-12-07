import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Keyboard,
  Platform,
} from 'react-native';
import toast from 'react-native-toast-message';
import MapboxGL from '@rnmapbox/maps';
import {
  checkAndRequestLocationPermission,
  getCurrentLocation,
  searchLocation as searchLocationService,
  reverseGeocode as reverseGeocodeService,
} from '../services/mapboxService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { LocationData, MapboxFeature } from '../types/MapboxPicker';
import type { Feature } from 'geojson';
import Config from '../config/env';
import { ScrollView } from 'react-native-gesture-handler';
MapboxGL.setAccessToken(Config.MAPBOX_ACCESS_TOKEN);

interface MapboxPickerProps {
  onLocationSelect: (location: LocationData) => Promise<void> | void;
  initialLocation?: LocationData;
  searchPlaceholder?: string;
  confirmButtonText?: string;
  showMyLocationButton?: boolean;
  showSearchBar?: boolean;
}

const MapboxPicker: React.FC<MapboxPickerProps> = ({
  onLocationSelect,
  initialLocation,
  searchPlaceholder = 'Tìm kiếm địa điểm ở Việt Nam...',
  confirmButtonText = 'Xác nhận vị trí',
  showMyLocationButton = true,
  showSearchBar = true,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<MapboxFeature[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    initialLocation || null,
  );
  const [markerCoordinate, setMarkerCoordinate] = useState<
    [number, number] | null
  >(
    initialLocation
      ? [initialLocation.longitude, initialLocation.latitude]
      : null,
  );
  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | null
  >(null);
  const [showCurrentLocation, setShowCurrentLocation] = useState<boolean>(true);
  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const searchTimeoutRef = useRef<number | null>(null);

  useEffect(() => {
    (async () => {
      const granted = await checkAndRequestLocationPermission();
      if (granted === true) {
        try {
          const coords = await getCurrentLocation();
          setCurrentLocation(coords);
          // Tự động zoom vào vị trí hiện tại khi lần đầu lấy được
          cameraRef.current?.setCamera({
            centerCoordinate: coords,
            zoomLevel: 16,
            animationDuration: 1000,
          });
        } catch (err) {
          console.warn('Lỗi lấy vị trí:', err);
        }
      }
    })();
  }, []);

  // If initialLocation is supplied/updated asynchronously (for example when
  // editing an existing address), update marker + selected location and
  // move the camera to that coordinate so the user sees the address on map.
  useEffect(() => {
    if (!initialLocation) return;

    const { latitude, longitude } = initialLocation;
    const coord: [number, number] = [longitude, latitude];

    setSelectedLocation(initialLocation);
    setMarkerCoordinate(coord);
    // Move camera to the provided location
    cameraRef.current?.setCamera({
      centerCoordinate: coord,
      zoomLevel: 16,
      animationDuration: 700,
    });
  }, [initialLocation]);

  const searchLocation = async (query: string): Promise<void> => {
    setLoading(true);
    try {
      const results = await searchLocationService(
        query,
        currentLocation ?? undefined,
      );
      setSearchResults(results.features || []);
    } catch (error) {
      setSearchResults([]);
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể tìm kiếm địa điểm. Vui lòng thử lại.',
      });
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (feature: MapboxFeature): void => {
    Keyboard.dismiss();
    const [longitude, latitude] = feature.center;

    const location: LocationData = {
      name: feature.place_name,
      latitude,
      longitude,
    };

    setSelectedLocation(location);
    setMarkerCoordinate([longitude, latitude]);
    // Clear search results and search input after selecting a result
    setSearchResults([]);
    setSearchQuery('');
    setShowCurrentLocation(false);

    cameraRef.current?.setCamera({
      centerCoordinate: [longitude, latitude],
      zoomLevel: 16,
      animationDuration: 1000,
    });
  };

  const handleMapPress = (feature: Feature): void => {
    if (!feature?.geometry) return;

    const { geometry } = feature;

    if (geometry.type === 'Point') {
      const [longitude, latitude] = geometry.coordinates as [number, number];
      reverseGeocode(longitude, latitude);
    }
  };

  const reverseGeocode = async (longitude: number, latitude: number) => {
    try {
      const location = await reverseGeocodeService(longitude, latitude);
      setMarkerCoordinate([longitude, latitude]);
      setSelectedLocation(location);
      setShowCurrentLocation(false);
    } catch (error) {
      const fallbackLocation: LocationData = {
        name: 'Vị trí đã chọn',
        latitude,
        longitude,
      };
      setMarkerCoordinate([longitude, latitude]);
      setSelectedLocation(fallbackLocation);
      setShowCurrentLocation(false);
    }
  };

  const handleConfirmLocation = (): void => {
    if (!selectedLocation) return;
    (async () => {
      setConfirmLoading(true);
      try {
        await onLocationSelect(selectedLocation);
      } catch (err) {
        // propagate or handle if needed
        console.warn('onLocationSelect error', err);
      } finally {
        setConfirmLoading(false);
      }
    })();
  };

  const handleMyLocation = async () => {
    const granted = await checkAndRequestLocationPermission();
    if (granted === true) {
      try {
        const coords = await getCurrentLocation();
        setCurrentLocation(coords);
        cameraRef.current?.setCamera({
          centerCoordinate: coords,
          zoomLevel: 16,
          animationDuration: 1000,
        });
        setShowCurrentLocation(true);
        setMarkerCoordinate(null);
        setSelectedLocation(null);
        setSearchQuery('');
      } catch (err) {
        console.warn('Lỗi lấy vị trí:', err);
      }
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Search Bar */}
      {showSearchBar && (
        <View className="flex-row items-center p-3 bg-white border-b border-gray-200 z-20">
          <Icon name="search" size={20} color="#999" className="mr-2" />
          <TextInput
            className="flex-1 h-11 text-base text-gray-900"
            placeholder={searchPlaceholder}
            placeholderTextColor="#999"
            value={searchQuery}
            onChangeText={text => {
              setSearchQuery(text);

              // Clear previous timeout
              if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
              }

              // Clear results if input is empty
              if (text.trim().length === 0) {
                setSearchResults([]);
                return;
              }

              searchTimeoutRef.current = setTimeout(() => {
                searchLocation(text);
              }, 500);
            }}
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {loading && (
            <ActivityIndicator className="ml-2" size="small" color="#e85a4f" />
          )}
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
                if (searchTimeoutRef.current) {
                  clearTimeout(searchTimeoutRef.current);
                }
              }}
              className="ml-2"
            >
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Search Results */}
      {searchQuery.length > 0 && !loading && (
        <ScrollView
          style={{
            maxHeight: 230,
            backgroundColor: 'white',
            zIndex: 10,
            position: 'absolute',
            top: showSearchBar ? 60 : 0,
            left: 0,
            right: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.25,
            shadowRadius: 4,
            elevation: 5,
          }}
        >
          {searchResults.length > 0 ? (
            <View>
              {searchResults.map(item => (
                <TouchableOpacity
                  key={item.id}
                  className="flex-row items-center px-4 py-3 border-b border-gray-100"
                  onPress={() => handleSelectLocation(item)}
                >
                  <Icon
                    name="place"
                    size={20}
                    color="#e85a4f"
                    className="mr-3"
                  />
                  <Text
                    className="flex-1 text-sm text-gray-800"
                    numberOfLines={2}
                  >
                    {item.place_name}
                  </Text>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="px-4 py-6 items-center">
              <Icon name="search-off" size={40} color="#e85a4f" />
              <Text className="text-sm text-gray-500 mt-2 text-center">
                Không tìm thấy địa điểm nào ở Việt Nam
              </Text>
            </View>
          )}
        </ScrollView>
      )}

      {/* Map */}
      <MapboxGL.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={MapboxGL.StyleURL.Street}
        onPress={handleMapPress}
        compassEnabled={true}
        logoEnabled={false}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={initialLocation ? 16 : 5}
          centerCoordinate={
            initialLocation
              ? [initialLocation.longitude, initialLocation.latitude]
              : [105.8342, 16.0]
          }
          animationDuration={0}
        />

        {/* Current Location Marker */}
        {currentLocation && showCurrentLocation && (
          <MapboxGL.PointAnnotation
            id="currentLocation"
            coordinate={currentLocation}
          >
            <View
              style={{
                width: 40,
                height: 40,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: 'white',
                borderRadius: 20,
                borderWidth: 2,
                borderColor: '#e85a4f',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Icon name="my-location" size={24} color="#e85a4f" />
            </View>
          </MapboxGL.PointAnnotation>
        )}

        {/* Selected Location Marker */}
        {markerCoordinate && (
          <MapboxGL.PointAnnotation
            id="selectedLocation"
            coordinate={markerCoordinate}
          >
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="place" size={40} color="#ef4444" />
            </View>
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>

      {/* My Location Button */}
      {showMyLocationButton && (
        <TouchableOpacity
          style={{
            position: 'absolute',
            bottom: 230,
            right: 10,
            backgroundColor: 'white',
            padding: 12,
            borderRadius: 28,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
          }}
          onPress={handleMyLocation}
          activeOpacity={0.7}
        >
          <Icon name="my-location" size={24} color="#e85a4f" />
        </TouchableOpacity>
      )}

      {/* Selected Location Info */}
      {selectedLocation && (
        <View
          style={{
            position: 'absolute',
            bottom: 0,
            left: 0,
            right: 0,
            backgroundColor: 'white',
            paddingTop: 20,
            paddingHorizontal: 20,
            paddingBottom: Platform.OS === 'ios' ? 34 : 20,
            borderTopLeftRadius: 24,
            borderTopRightRadius: 24,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 12,
            elevation: 10,
          }}
        >
          <View className="flex-row items-center mb-3">
            <View className="w-10 h-10 rounded-full bg-red-50 items-center justify-center">
              <Icon name="place" size={22} color="#ef4444" />
            </View>
            <Text className="text-lg font-bold ml-3 text-gray-800 flex-1">
              Vị trí đã chọn
            </Text>
          </View>
          <Text className="text-base text-gray-900 font-medium mb-2">
            {selectedLocation.name}
          </Text>
          <View className="flex-row items-center mb-5">
            <Icon name="gps-fixed" size={14} color="#9ca3af" />
            <Text className="text-xs text-gray-400 ml-1">
              {selectedLocation.latitude.toFixed(6)},{' '}
              {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-primary-100 py-4 rounded-xl items-center flex-row justify-center"
            onPress={() => {
              if (!confirmLoading) handleConfirmLocation();
            }}
            activeOpacity={0.8}
            disabled={confirmLoading}
            style={{
              shadowColor: '#e85a4f',
              shadowOffset: { width: 0, height: 4 },
              shadowOpacity: 0.3,
              shadowRadius: 8,
              elevation: 6,
            }}
          >
            {confirmLoading ? (
              <ActivityIndicator size="small" color="#fff" className="mr-2" />
            ) : null}
            <Text className="text-white text-base font-semibold">
              {confirmLoading ? 'Đang xử lý...' : confirmButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MapboxPicker;
