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
import type {
  LocationData,
  LocationIQResult,
  MapboxFeature,
} from '../types/MapboxPicker';
import type { Feature } from 'geojson';
import Config from '../config/env';
import { ScrollView } from 'react-native-gesture-handler';
import AppButton from './ui/AppButton';

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
  const [searchResults, setSearchResults] = useState<LocationIQResult[]>([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [selectedLocation, setSelectedLocation] = useState<LocationData | null>(
    null,
  );
  const [markerCoordinate, setMarkerCoordinate] = useState<
    [number, number] | null
  >(null);
  const [initialCamera, setInitialCamera] = useState<{
    centerCoordinate: [number, number];
    zoomLevel: number;
  } | null>(null);

  const [confirmLoading, setConfirmLoading] = useState<boolean>(false);

  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const searchTimeoutRef = useRef<number | null>(null);
  const hasInitialized = useRef(false);

  // Set initial camera position based on initialLocation
  useEffect(() => {
    if (initialLocation && !hasInitialized.current) {
      if (initialLocation?.latitude === 0 && initialLocation?.longitude === 0) {
        // Will use current location in handleMapReady
        setInitialCamera({
          centerCoordinate: [106.6297, 10.8231],
          zoomLevel: 10,
        });
      } else {
        const coords: [number, number] = [
          initialLocation.longitude,
          initialLocation.latitude,
        ];
        setInitialCamera({
          centerCoordinate: coords,
          zoomLevel: 16,
        });
        setMarkerCoordinate(coords);
        setSelectedLocation({
          name: initialLocation.name || '',
          latitude: initialLocation.latitude,
          longitude: initialLocation.longitude,
        });
      }
      hasInitialized.current = true;
    }
  }, [initialLocation]);

  const handleMapReady = async () => {
    const granted = await checkAndRequestLocationPermission();
    if (granted === true) {
      try {
        if (
          initialLocation?.latitude === 0 &&
          initialLocation?.longitude === 0
        ) {
          const coords = await getCurrentLocation();

          setMarkerCoordinate(coords);
          const name = await reverseGeocodeService(coords[0], coords[1]);
          setSelectedLocation({
            name: name.name,
            latitude: coords[1],
            longitude: coords[0],
          });

          // Delay để đảm bảo camera đã sẵn sàng
          setTimeout(() => {
            cameraRef.current?.setCamera({
              centerCoordinate: coords,
              zoomLevel: 16,
              animationDuration: 1000,
            });
          }, 300);
        }
      } catch (err) {
        console.warn('Lỗi lấy vị trí:', err);
      }
    }
  };

  const searchLocation = async (query: string): Promise<void> => {
    setLoading(true);
    try {
      const results = await searchLocationService(query);
      setSearchResults(results || []);
    } catch (error) {
      setSearchResults([]);
    } finally {
      setLoading(false);
    }
  };

  const handleSelectLocation = (item: LocationIQResult): void => {
    Keyboard.dismiss();
    const [longitude, latitude] =
      item.lon && item.lat
        ? [parseFloat(item.lon), parseFloat(item.lat)]
        : [0, 0];

    const location: LocationData = {
      name: item.display_name,
      latitude,
      longitude,
    };

    setSelectedLocation(location);
    setMarkerCoordinate([longitude, latitude]);

    setSearchResults([]);
    setSearchQuery('');

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
    // Set marker trước để hiển thị ngay
    setMarkerCoordinate([longitude, latitude]);

    try {
      const location = await reverseGeocodeService(longitude, latitude);
      setSelectedLocation(location);
    } catch (error) {
      console.warn('Reverse geocode error:', error);
      const fallbackLocation: LocationData = {
        name: 'Vị trí đã chọn',
        latitude,
        longitude,
      };
      setSelectedLocation(fallbackLocation);
    }
  };

  const handleConfirmLocation = (): void => {
    if (!selectedLocation) return;
    (async () => {
      setConfirmLoading(true);
      try {
        await onLocationSelect(selectedLocation);
      } catch (err) {
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

        cameraRef.current?.setCamera({
          centerCoordinate: coords,
          zoomLevel: 16,
          animationDuration: 1000,
        });

        // Tự động chọn vị trí hiện tại
        const [longitude, latitude] = coords;
        await reverseGeocode(longitude, latitude);
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
              if (searchTimeoutRef.current) {
                clearTimeout(searchTimeoutRef.current);
              }
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
                  key={item.place_id}
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
                    {item.display_name}
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
        onDidFinishLoadingMap={handleMapReady}
        compassEnabled={true}
        logoEnabled={false}
      >
        <MapboxGL.Camera
          ref={cameraRef}
          zoomLevel={initialCamera?.zoomLevel || 5}
          centerCoordinate={initialCamera?.centerCoordinate || [105.8342, 16.0]}
          animationDuration={0}
        />

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
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 5,
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
          <AppButton
            title={confirmButtonText}
            onPress={handleConfirmLocation}
            loading={confirmLoading}
            disabled={
              selectedLocation?.latitude === 0 &&
              selectedLocation?.longitude === 0
            }
          />
        </View>
      )}
    </View>
  );
};

export default MapboxPicker;
