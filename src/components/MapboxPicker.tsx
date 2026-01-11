import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Keyboard,
  Platform,
  Dimensions,
} from 'react-native';
import toast from 'react-native-toast-message';
import MapboxGL from '@rnmapbox/maps';
import {
  checkAndRequestLocationPermission,
  getCurrentLocation,
  searchLocation as searchLocationService,
  reverseGeocode as reverseGeocodeService,
  resolvePlace,
} from '../services/mapboxService';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type {
  LocationData,
  MapboxFeature,
  OpenMapAutocompleteResult,
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

const { width, height } = Dimensions.get('window');
const MapboxPicker: React.FC<MapboxPickerProps> = ({
  onLocationSelect,
  initialLocation,
  searchPlaceholder = 'Tìm kiếm địa điểm ở Việt Nam...',
  confirmButtonText = 'Xác nhận vị trí',
  showMyLocationButton = true,
  showSearchBar = true,
}) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<
    OpenMapAutocompleteResult[]
  >([]);
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

  const handleSelectLocation = async (
    item: OpenMapAutocompleteResult,
  ): Promise<void> => {
    Keyboard.dismiss();

    try {
      const addressDetails = await resolvePlace(item.place_id);
      if (!addressDetails) {
        toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể lấy thông tin địa điểm',
        });
        return;
      }

      const location: LocationData = {
        name: addressDetails.name,
        latitude: addressDetails.latitude,
        longitude: addressDetails.longitude,
      };

      setSelectedLocation(location);
      setMarkerCoordinate([addressDetails.longitude, addressDetails.latitude]);

      setSearchResults([]);
      setSearchQuery('');

      cameraRef.current?.setCamera({
        centerCoordinate: [addressDetails.longitude, addressDetails.latitude],
        zoomLevel: 16,
        animationDuration: 1000,
      });
    } catch (error) {
      console.error('Error resolving place:', error);
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể lấy thông tin địa điểm',
      });
    }
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
    <View className="flex-1 bg-gray-50">
      <View className="mx-4 mb-3 flex-row items-center border-2 border-red-200 rounded-2xl px-4 py-1 z-20">
        <Icon name="search" size={22} color="#e85a4f" />
        <TextInput
          className="flex-1 ml-3 text-base text-gray-900 font-medium"
          placeholder={searchPlaceholder}
          placeholderTextColor="#9ca3af"
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
            }, 1500);
          }}
          onSubmitEditing={() => {
            if (searchTimeoutRef.current) {
              clearTimeout(searchTimeoutRef.current);
            }
            searchLocation(searchQuery);
          }}
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
            className="ml-2 bg-gray-200 rounded-full p-1"
            activeOpacity={0.7}
          >
            <Icon name="close" size={18} color="#6b7280" />
          </TouchableOpacity>
        )}
      </View>

      {/* Search Results */}
      {searchQuery.length > 0 && !loading && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          style={{
            maxHeight: 230,
            backgroundColor: '#F9FAFB',
            zIndex: 10,
            position: 'absolute',
            top: height * 0.075,
            left: 0,
            right: 0,
            borderBottomWidth: 1,
            borderBottomColor: '#e5e7eb',
            paddingVertical: 4,
          }}
          contentContainerStyle={{
            paddingBottom: 20,
          }}
        >
          {searchResults.length > 0 ? (
            <View>
              {searchResults.map((item, index) => (
                <TouchableOpacity
                  key={item.place_id}
                  className={`flex-row items-start px-4 py-3.5 ${
                    index !== searchResults.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                  onPress={() => handleSelectLocation(item)}
                  activeOpacity={0.7}
                >
                  <View className="bg-red-50 rounded-full p-2 mr-3 mt-0.5">
                    <Icon name="place" size={18} color="#e85a4f" />
                  </View>
                  <View className="flex-1">
                    <Text
                      className="text-sm font-semibold text-text-main"
                      numberOfLines={2}
                    >
                      {item.description}
                    </Text>
                  </View>
                </TouchableOpacity>
              ))}
            </View>
          ) : (
            <View className="px-4 py-8 items-center">
              <View className="bg-red-50 rounded-full p-4 mb-3">
                <Icon name="search-off" size={32} color="#e85a4f" />
              </View>
              <Text className="text-sm font-semibold text-gray-700 mb-1">
                Không tìm thấy kết quả
              </Text>
              <Text className="text-xs text-gray-500 text-center">
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

      {selectedLocation && searchQuery == '' && (
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
