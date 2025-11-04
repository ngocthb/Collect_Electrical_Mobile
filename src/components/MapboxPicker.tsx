import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  FlatList,
  ActivityIndicator,
  Alert,
  Keyboard,
} from 'react-native';
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
MapboxGL.setAccessToken(Config.MAPBOX_ACCESS_TOKEN);

interface MapboxPickerProps {
  onLocationSelect: (location: LocationData) => void;
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

  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);

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
      if (!results.features || results.features.length === 0) {
        Alert.alert('Thông báo', 'Không tìm thấy địa điểm nào ở Việt Nam');
      }
    } catch (error) {
      setSearchResults([]);
      Alert.alert('Lỗi', 'Không thể tìm kiếm địa điểm. Vui lòng thử lại.');
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
    setSearchResults([]);
    setSearchQuery(feature.place_name);
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
      setSearchQuery(location.name);
      setShowCurrentLocation(false);
    } catch (error) {
      const fallbackLocation: LocationData = {
        name: 'Vị trí đã chọn',
        latitude,
        longitude,
      };
      setMarkerCoordinate([longitude, latitude]);
      setSelectedLocation(fallbackLocation);
      setSearchQuery('Vị trí đã chọn');
      setShowCurrentLocation(false);
    }
  };

  const handleConfirmLocation = (): void => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
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
              searchLocation(text);
            }}
            onSubmitEditing={() => Keyboard.dismiss()}
          />
          {loading && (
            <ActivityIndicator className="ml-2" size="small" color="#3b82f6" />
          )}
          {searchQuery.length > 0 && (
            <TouchableOpacity
              onPress={() => {
                setSearchQuery('');
                setSearchResults([]);
              }}
              className="ml-2"
            >
              <Icon name="close" size={20} color="#999" />
            </TouchableOpacity>
          )}
        </View>
      )}

      {/* Search Results */}
      {searchResults.length > 0 && (
        <View className="absolute top-16 left-2 right-2 max-h-72 bg-white rounded-xl shadow-lg z-30">
          <FlatList
            data={searchResults}
            keyExtractor={item => item.id}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="flex-row items-center px-4 py-3 border-b border-gray-100"
                onPress={() => handleSelectLocation(item)}
              >
                <Icon name="place" size={20} color="#3b82f6" className="mr-3" />
                <Text
                  className="flex-1 text-sm text-gray-800"
                  numberOfLines={2}
                >
                  {item.place_name}
                </Text>
              </TouchableOpacity>
            )}
            keyboardShouldPersistTaps="handled"
          />
        </View>
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
                borderColor: '#3b82f6',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              <Icon name="my-location" size={24} color="#3b82f6" />
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
          className="absolute right-4 bottom-56 w-14 h-14 rounded-full bg-white items-center justify-center shadow-lg"
          onPress={handleMyLocation}
          activeOpacity={0.7}
        >
          <Icon name="my-location" size={24} color="#3b82f6" />
        </TouchableOpacity>
      )}

      {/* Selected Location Info */}
      {selectedLocation && (
        <View className="absolute bottom-0 left-0 right-0 bg-white p-5 rounded-t-3xl shadow-lg">
          <View className="flex-row items-center mb-3">
            <Icon name="place" size={24} color="#ef4444" />
            <Text className="text-lg font-bold ml-2 text-gray-800">
              Vị trí đã chọn
            </Text>
          </View>
          <Text className="text-base text-gray-700 mb-1">
            {selectedLocation.name}
          </Text>
          <View className="flex-row items-center mb-4">
            <Icon name="gps-fixed" size={14} color="#999" />
            <Text className="text-xs text-gray-400 ml-1">
              {selectedLocation.latitude.toFixed(6)},{' '}
              {selectedLocation.longitude.toFixed(6)}
            </Text>
          </View>
          <TouchableOpacity
            className="bg-blue-500 py-4 rounded-xl items-center flex-row justify-center"
            onPress={handleConfirmLocation}
            activeOpacity={0.8}
          >
            <Icon
              name="check-circle"
              size={20}
              color="white"
              className="mr-2"
            />
            <Text className="text-white text-base font-semibold">
              {confirmButtonText}
            </Text>
          </TouchableOpacity>
        </View>
      )}
    </View>
  );
};

export default MapboxPicker;
