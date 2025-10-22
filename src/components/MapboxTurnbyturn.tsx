import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Platform,
  PermissionsAndroid,
  Alert,
  Linking,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Geolocation from 'react-native-geolocation-service';
import Icon from 'react-native-vector-icons/MaterialIcons';
import type { Feature, LineString } from 'geojson';

MapboxGL.setAccessToken(
  'pk.eyJ1IjoibmdvY3RoYiIsImEiOiJjbWgxdmdzMWowcjliZjFzYjMwaDlqamJiIn0.qna079CtYSrSqD-YhlQArg',
);

export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
}

interface NavigationStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
}

interface RouteData {
  distance: number;
  duration: number;
  geometry: LineString;
  steps: NavigationStep[];
}

interface MapboxPickerProps {
  onLocationSelect: (location: LocationData) => void;
  initialLocation?: LocationData;
  searchPlaceholder?: string;
  confirmButtonText?: string;
  showMyLocationButton?: boolean;
  onMapDirectionPress?: (location: LocationData | [number, number]) => void;
}

const MapboxTurnbyturn: React.FC<MapboxPickerProps> = ({
  onLocationSelect,
  initialLocation,

  confirmButtonText = 'Xác nhận vị trí',
  showMyLocationButton = true,

  onMapDirectionPress,
}) => {
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

  const [initialLocationSet, setInitialLocationSet] = useState<boolean>(false);

  // Navigation states
  const [isNavigating, setIsNavigating] = useState<boolean>(false);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [currentStepIndex, setCurrentStepIndex] = useState<number>(0);
  const [navigationLoading, setNavigationLoading] = useState<boolean>(false);

  const mapRef = useRef<MapboxGL.MapView>(null);
  const cameraRef = useRef<MapboxGL.Camera>(null);
  const watchIdRef = useRef<number | null>(null);

  useEffect(() => {
    checkAndRequestLocationPermission();

    return () => {
      if (watchIdRef.current !== null) {
        Geolocation.clearWatch(watchIdRef.current);
      }
    };
  }, []);

  // Auto-start navigation when both currentLocation and initialLocation are available
  useEffect(() => {
    if (
      currentLocation &&
      initialLocation &&
      markerCoordinate &&
      !isNavigating
    ) {
      getDirections();
    }
  }, [currentLocation, initialLocation, markerCoordinate]);

  const checkAndRequestLocationPermission = async () => {
    if (Platform.OS === 'ios') {
      Geolocation.requestAuthorization('whenInUse').then(status => {
        console.log('iOS Location Permission:', status);
        if (status === 'granted') {
          getCurrentLocation();
        } else if (status === 'denied') {
          Alert.alert(
            'Cần quyền truy cập vị trí',
            'Vui lòng bật quyền vị trí trong Cài đặt',
            [
              { text: 'Huỷ', style: 'cancel' },
              { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
            ],
          );
        }
      });
    } else {
      try {
        const granted = await PermissionsAndroid.request(
          PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
          {
            title: 'Quyền truy cập vị trí',
            message:
              'Ứng dụng cần quyền truy cập vị trí của bạn để hiển thị trên bản đồ',
            buttonNeutral: 'Hỏi lại sau',
            buttonNegative: 'Từ chối',
            buttonPositive: 'Đồng ý',
          },
        );

        if (granted === PermissionsAndroid.RESULTS.GRANTED) {
          getCurrentLocation();
        } else {
          Alert.alert(
            'Cần quyền truy cập vị trí',
            'Vui lòng bật quyền vị trí trong Cài đặt',
            [
              { text: 'Huỷ', style: 'cancel' },
              { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
            ],
          );
        }
      } catch (err) {
        console.warn('Permission error:', err);
      }
    }
  };

  const getCurrentLocation = () => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const coords: [number, number] = [longitude, latitude];
        setCurrentLocation(coords);

        if (!initialLocationSet && !initialLocation) {
          setTimeout(() => {
            cameraRef.current?.setCamera({
              centerCoordinate: coords,
              zoomLevel: 15,
              animationDuration: 1500,
            });
            setInitialLocationSet(true);
          }, 300);
        }
      },
      error => {
        console.error('❌ Geolocation Error:', error);
        Alert.alert(
          'Lỗi lấy vị trí',
          `Không thể lấy vị trí hiện tại: ${error.message}. Vui lòng kiểm tra GPS.`,
          [
            { text: 'OK' },
            { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
          ],
        );
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        showLocationDialog: true,
      },
    );
  };

  const handleMapPress = (feature: Feature): void => {
    if (!feature?.geometry) return;
    const { geometry } = feature;
    if (geometry.type === 'Point') {
      const [longitude, latitude] = geometry.coordinates as [number, number];
      reverseGeocode(longitude, latitude);
      if (onMapDirectionPress) {
        onMapDirectionPress([longitude, latitude]);
      }
    }
  };

  const reverseGeocode = async (longitude: number, latitude: number) => {
    try {
      const response = await fetch(
        `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
          `access_token=pk.eyJ1IjoibmdvY3RoYiIsImEiOiJjbWgxdmdzMWowcjliZjFzYjMwaDlqamJiIn0.qna079CtYSrSqD-YhlQArg` +
          `&language=vi` +
          `&country=VN`,
      );
      const data = await response.json();

      const placeName = data.features?.[0]?.place_name || 'Vị trí đã chọn';

      const location: LocationData = {
        name: placeName,
        latitude,
        longitude,
      };

      setMarkerCoordinate([longitude, latitude]);
      setSelectedLocation(location);
    } catch (error) {
      console.error('Reverse geocoding error:', error);

      const location: LocationData = {
        name: 'Vị trí đã chọn',
        latitude,
        longitude,
      };
      setMarkerCoordinate([longitude, latitude]);
      setSelectedLocation(location);
    }
  };

  const handleConfirmLocation = (): void => {
    if (selectedLocation) {
      onLocationSelect(selectedLocation);
    }
  };

  const handleMyLocation = () => {
    if (currentLocation) {
      cameraRef.current?.setCamera({
        centerCoordinate: currentLocation,
        zoomLevel: 16,
        animationDuration: 1000,
      });

      setMarkerCoordinate(null);
      setSelectedLocation(null);
    } else {
      checkAndRequestLocationPermission();
    }
  };

  // Navigation functions
  const getManeuverIcon = (type: string, modifier?: string): string => {
    const maneuverMap: { [key: string]: string } = {
      'turn-sharp-right': 'subdirectory-arrow-right',
      'turn-right': 'turn-right',
      'turn-slight-right': 'turn-slight-right',
      'turn-sharp-left': 'subdirectory-arrow-left',
      'turn-left': 'turn-left',
      'turn-slight-left': 'turn-slight-left',
      continue: 'straight',
      merge: 'merge',
      roundabout: 'trip-origin',
      arrive: 'place',
      depart: 'navigation',
    };

    return maneuverMap[type] || 'navigation';
  };

  const formatDistance = (meters: number): string => {
    if (meters < 1000) {
      return `${Math.round(meters)}m`;
    }
    return `${(meters / 1000).toFixed(1)}km`;
  };

  const formatDuration = (seconds: number): string => {
    const minutes = Math.round(seconds / 60);
    if (minutes < 60) {
      return `${minutes} phút`;
    }
    const hours = Math.floor(minutes / 60);
    const mins = minutes % 60;
    return `${hours}h ${mins}m`;
  };

  const calculateDistance = (
    lat1: number,
    lon1: number,
    lat2: number,
    lon2: number,
  ): number => {
    const R = 6371e3; // Earth radius in meters
    const φ1 = (lat1 * Math.PI) / 180;
    const φ2 = (lat2 * Math.PI) / 180;
    const Δφ = ((lat2 - lat1) * Math.PI) / 180;
    const Δλ = ((lon2 - lon1) * Math.PI) / 180;

    const a =
      Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
      Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
    const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

    return R * c;
  };

  const getDirections = async () => {
    if (!currentLocation || !markerCoordinate) {
      Alert.alert('Lỗi', 'Vui lòng chọn điểm đến');
      return;
    }

    setNavigationLoading(true);

    try {
      const startCoords = `${currentLocation[0]},${currentLocation[1]}`;
      const endCoords = `${markerCoordinate[0]},${markerCoordinate[1]}`;

      const url =
        `https://api.mapbox.com/directions/v5/mapbox/driving/${startCoords};${endCoords}?` +
        `access_token=pk.eyJ1IjoibmdvY3RoYiIsImEiOiJjbWgxdmdzMWowcjliZjFzYjMwaDlqamJiIn0.qna079CtYSrSqD-YhlQArg` +
        `&geometries=geojson` +
        `&steps=true` +
        `&banner_instructions=true` +
        `&language=vi` +
        `&overview=full`;

      const response = await fetch(url);
      const data = await response.json();

      if (data.routes && data.routes.length > 0) {
        const route = data.routes[0];

        const steps: NavigationStep[] = route.legs[0].steps.map(
          (step: any) => ({
            instruction: step.maneuver.instruction,
            distance: step.distance,
            duration: step.duration,
            maneuver: {
              type: step.maneuver.type,
              modifier: step.maneuver.modifier,
              location: step.maneuver.location,
            },
          }),
        );

        setRouteData({
          distance: route.distance,
          duration: route.duration,
          geometry: route.geometry,
          steps,
        });

        setIsNavigating(true);
        setCurrentStepIndex(0);
        startLocationTracking();

        // Fit map to route
        const coordinates = route.geometry.coordinates;
        const bounds = coordinates.reduce(
          (acc: any, coord: [number, number]) => {
            return {
              ne: [
                Math.max(acc.ne[0], coord[0]),
                Math.max(acc.ne[1], coord[1]),
              ],
              sw: [
                Math.min(acc.sw[0], coord[0]),
                Math.min(acc.sw[1], coord[1]),
              ],
            };
          },
          {
            ne: [coordinates[0][0], coordinates[0][1]],
            sw: [coordinates[0][0], coordinates[0][1]],
          },
        );

        cameraRef.current?.fitBounds(
          bounds.ne,
          bounds.sw,
          [50, 50, 50, 50],
          1000,
        );
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy đường đi');
      }
    } catch (error) {
      console.error('Error getting directions:', error);
      Alert.alert('Lỗi', 'Không thể lấy chỉ đường. Vui lòng thử lại.');
    } finally {
      setNavigationLoading(false);
    }
  };

  const startLocationTracking = () => {
    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
    }

    watchIdRef.current = Geolocation.watchPosition(
      position => {
        const { latitude, longitude } = position.coords;
        const newLocation: [number, number] = [longitude, latitude];
        setCurrentLocation(newLocation);

        // Update current step based on distance
        if (routeData && routeData.steps.length > 0) {
          const currentStep = routeData.steps[currentStepIndex];
          const distanceToManeuver = calculateDistance(
            latitude,
            longitude,
            currentStep.maneuver.location[1],
            currentStep.maneuver.location[0],
          );

          // Move to next step if within 20 meters of maneuver
          if (
            distanceToManeuver < 20 &&
            currentStepIndex < routeData.steps.length - 1
          ) {
            setCurrentStepIndex(prev => prev + 1);
          }

          // Center camera on current location during navigation
          cameraRef.current?.setCamera({
            centerCoordinate: newLocation,
            zoomLevel: 17,
            animationDuration: 500,
          });
        }
      },
      error => {
        console.error('Location tracking error:', error);
      },
      {
        enableHighAccuracy: true,
        distanceFilter: 10,
        interval: 1000,
        fastestInterval: 500,
      },
    );
  };

  const stopNavigation = () => {
    setIsNavigating(false);
    setRouteData(null);
    setCurrentStepIndex(0);

    if (watchIdRef.current !== null) {
      Geolocation.clearWatch(watchIdRef.current);
      watchIdRef.current = null;
    }

    getCurrentLocation();
  };

  // Helper to override maneuver instructions
  const getVietnameseInstruction = (type: string, modifier?: string) => {
    switch (type) {
      case 'turn-right':
      case 'turn-sharp-right':
      case 'turn-slight-right':
        return 'Rẽ phải';
      case 'turn-left':
      case 'turn-sharp-left':
      case 'turn-slight-left':
        return 'Rẽ trái';
      case 'continue':
        return 'Đi thẳng';
      case 'arrive':
        return 'Đến nơi';
      case 'depart':
        return 'Bắt đầu di chuyển';
      case 'merge':
        return 'Nhập làn';
      case 'roundabout':
        return 'Vào vòng xoay';
      default:
        return 'Di chuyển theo hướng dẫn';
    }
  };

  return (
    <View className="flex-1 bg-white">
      {/* Current Step Instruction */}
      {isNavigating && routeData && routeData.steps[currentStepIndex] && (
        <View className="bg-white p-4 border-b border-gray-200 z-20">
          <View className="flex-row items-center">
            <View className="w-12 h-12 rounded-full bg-blue-100 items-center justify-center mr-3">
              <Icon
                name={getManeuverIcon(
                  routeData.steps[currentStepIndex].maneuver.type,
                  routeData.steps[currentStepIndex].maneuver.modifier,
                )}
                size={24}
                color="#3b82f6"
              />
            </View>
            <View className="flex-1">
              <Text className="text-base font-semibold text-gray-800 mb-1">
                {getVietnameseInstruction(
                  routeData.steps[currentStepIndex].maneuver.type,
                  routeData.steps[currentStepIndex].maneuver.modifier,
                )}
              </Text>
              <Text className="text-sm text-gray-500">
                {formatDistance(routeData.steps[currentStepIndex].distance)}
              </Text>
            </View>
            <TouchableOpacity
              onPress={stopNavigation}
              className="bg-white/20 px-4 py-2 rounded-lg"
            >
              <Text className="text-primary-100 font-semibold">Dừng</Text>
            </TouchableOpacity>
          </View>
        </View>
      )}

      {/* Map */}
      <MapboxGL.MapView
        ref={mapRef}
        style={{ flex: 1 }}
        styleURL={MapboxGL.StyleURL.Street}
        // onPress removed to disable tap-to-select-location
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

        {/* Route Line */}
        {isNavigating && routeData && (
          <MapboxGL.ShapeSource id="routeSource" shape={routeData.geometry}>
            <MapboxGL.LineLayer
              id="routeLine"
              style={{
                lineColor: '#3b82f6',
                lineWidth: 5,
                lineCap: 'round',
                lineJoin: 'round',
              }}
            />
          </MapboxGL.ShapeSource>
        )}

        {/* Current Location Marker */}
        {currentLocation && (
          <MapboxGL.PointAnnotation
            id="currentLocation"
            coordinate={currentLocation}
          >
            <View
              style={{
                width: isNavigating ? 32 : 40,
                height: isNavigating ? 32 : 40,
                alignItems: 'center',
                justifyContent: 'center',
                backgroundColor: isNavigating ? '#3b82f6' : 'white',
                borderRadius: isNavigating ? 16 : 20,
                borderWidth: isNavigating ? 4 : 2,
                borderColor: isNavigating ? 'white' : '#3b82f6',
                shadowColor: '#000',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.25,
                shadowRadius: 4,
                elevation: 5,
              }}
            >
              {!isNavigating && (
                <Icon name="my-location" size={24} color="#3b82f6" />
              )}
            </View>
          </MapboxGL.PointAnnotation>
        )}

        {markerCoordinate && !isNavigating && (
          <MapboxGL.PointAnnotation
            id="selectedLocation"
            coordinate={markerCoordinate}
          >
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="location-on" size={40} color="#ef4444" />
            </View>
          </MapboxGL.PointAnnotation>
        )}

        {/* Destination Marker during Navigation */}
        {markerCoordinate && isNavigating && (
          <MapboxGL.PointAnnotation
            id="destinationMarker"
            coordinate={markerCoordinate}
          >
            <View style={{ alignItems: 'center', justifyContent: 'center' }}>
              <Icon name="location-on" size={40} color="#ef4444" />
            </View>
          </MapboxGL.PointAnnotation>
        )}
      </MapboxGL.MapView>

      {/* My Location Button */}
      {showMyLocationButton && !isNavigating && (
        <TouchableOpacity
          className="absolute right-4 bottom-56 w-14 h-14 rounded-full bg-white items-center justify-center shadow-lg"
          onPress={handleMyLocation}
          activeOpacity={0.7}
        >
          <Icon name="my-location" size={24} color="#3b82f6" />
        </TouchableOpacity>
      )}

      {/* Selected Location Info */}
      {selectedLocation && !isNavigating && (
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

          <View className="flex-row space-x-2">
            <TouchableOpacity
              className="bg-blue-500 py-4 rounded-xl items-center flex-row justify-center flex-1"
              onPress={getDirections}
              activeOpacity={0.8}
              disabled={navigationLoading || !currentLocation}
            >
              {navigationLoading ? (
                <ActivityIndicator size="small" color="white" />
              ) : (
                <>
                  <Icon
                    name="directions"
                    size={20}
                    color="white"
                    className="mr-2"
                  />
                  <Text className="text-white text-base font-semibold">
                    Chỉ đường
                  </Text>
                </>
              )}
            </TouchableOpacity>

            <TouchableOpacity
              className="bg-green-500 py-4 rounded-xl items-center flex-row justify-center flex-1"
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
        </View>
      )}
    </View>
  );
};

export default MapboxTurnbyturn;
