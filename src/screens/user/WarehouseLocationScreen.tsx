import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
  TouchableOpacity,
  ActivityIndicator,
  Alert,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Icon from 'react-native-vector-icons/Feather';
import {
  checkAndRequestLocationPermission,
  getCurrentLocation,
  getDirections as getDirectionsService,
} from '../../services/mapboxService';
import type { RouteData } from '../../services/mapboxService';
import type { Feature } from 'geojson';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/native';
import AppButton from '../../components/ui/AppButton';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_HEIGHT = SCREEN_HEIGHT * 0.2;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.4;

// (removed week strip)

// Example warehouse locations (thu gom)
const warehouses = [
  {
    id: 'wh-1',
    name: 'Kho Thu Gom Trung Tâm',
    address: 'Số 1, Đường A, Khu vực Vinhomes Grand Park, Thủ Đức, TP.HCM',
    lat: 10.8411,
    lng: 106.8283,
    open: '08:00',
    close: '17:00',
  },
  {
    id: 'wh-2',
    name: 'Kho Thu Gom Đông Nam',
    address: 'Số 27, Đường B, Phường Long Thạnh Mỹ, Thủ Đức, TP.HCM',
    lat: 10.8465,
    lng: 106.834,
    open: '09:00',
    close: '18:00',
  },
  {
    id: 'wh-3',
    name: 'Kho Thu Gom Tây',
    address: 'Số 99, Đường C, Quận 9, TP.HCM',
    lat: 10.835,
    lng: 106.82,
    open: '07:30',
    close: '16:30',
  },
];

const WarehouseLocationScreen = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | null
  >(null);
  const [routeData, setRouteData] = useState<RouteData | null>(null);
  const [navigationLoading, setNavigationLoading] = useState(false);
  const panelHeight = useRef(new Animated.Value(MIN_HEIGHT)).current;
  const navigation = useNavigation<any>();
  const mapRef = useRef<MapboxGL.MapView | null>(null);
  const cameraRef = useRef<MapboxGL.Camera | null>(null);
  const markerScales = useRef(
    warehouses.map(() => new Animated.Value(1)),
  ).current;

  useEffect(() => {
    (async () => {
      const granted = await checkAndRequestLocationPermission();
      if (granted === true) {
        try {
          const coords = await getCurrentLocation();
          setCurrentLocation(coords);
        } catch (err) {
          console.warn('Lỗi lấy vị trí:', err);
        }
      } else {
        setCurrentLocation([106.69, 10.78]); // default location
      }
    })();
  }, []);

  // Center map on user's location
  const handleMyLocation = async () => {
    try {
      const coords = await getCurrentLocation();
      setCurrentLocation(coords);
      cameraRef.current?.setCamera({
        centerCoordinate: coords,
        zoomLevel: 15,
        animationDuration: 800,
      });
    } catch (err) {
      Alert.alert('Lỗi', 'Không thể lấy vị trí hiện tại');
    }
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = isExpanded
          ? MAX_HEIGHT - gestureState.dy
          : MIN_HEIGHT - gestureState.dy;

        if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
          panelHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50 && !isExpanded) {
          expandPanel();
        } else if (gestureState.dy > 50 && isExpanded) {
          collapsePanel();
        } else {
          Animated.spring(panelHeight, {
            toValue: isExpanded ? MAX_HEIGHT : MIN_HEIGHT,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  const expandPanel = () => {
    setIsExpanded(true);
    Animated.spring(panelHeight, {
      toValue: MAX_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  const collapsePanel = () => {
    setIsExpanded(false);
    Animated.spring(panelHeight, {
      toValue: MIN_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  // Handle map press to detect marker clicks (warehouse markers)
  const handleMapPress = (feature: Feature) => {
    if (!feature?.properties?.id) return;
    // warehouse markers will have id like 'warehouse-<index>' or use warehouse ids
    const id = String(feature.properties.id);
    if (id.startsWith('warehouse-')) {
      const idx = parseInt(id.replace('warehouse-', ''), 10) - 1;
      if (!isNaN(idx) && idx >= 0 && idx < warehouses.length) {
        setSelected(idx);
        // animate and center on selected
        if (!isExpanded) expandPanel();
        cameraRef.current?.setCamera({
          centerCoordinate: [warehouses[idx].lng, warehouses[idx].lat],
          zoomLevel: 14,
          animationDuration: 600,
        });
      }
    }
  };

  // Animate marker scale when selection changes
  useEffect(() => {
    markerScales.forEach((val, idx) => {
      Animated.spring(val, {
        toValue: selected === idx ? 1.18 : 1,
        useNativeDriver: true,
        tension: 120,
        friction: 8,
      }).start();
    });
  }, [selected, markerScales]);

  const handleGetDirections = async (whIdx: number) => {
    if (!currentLocation) {
      Alert.alert('Chưa có vị trí của bạn', 'Vui lòng bật vị trí để chỉ đường');
      return;
    }
    const wh = warehouses[whIdx];
    setNavigationLoading(true);
    try {
      const route = await getDirectionsService(currentLocation, [
        wh.lng,
        wh.lat,
      ]);
      if (route) {
        setRouteData(route);
        // fit camera to route bounds
        const coords = route.geometry.coordinates.filter(
          (c): c is [number, number] => Array.isArray(c) && c.length === 2,
        );
        if (coords.length > 0) {
          const bounds = coords.reduce<{
            ne: [number, number];
            sw: [number, number];
          }>(
            (acc, coord) => ({
              ne: [
                Math.max(acc.ne[0], coord[0]),
                Math.max(acc.ne[1], coord[1]),
              ],
              sw: [
                Math.min(acc.sw[0], coord[0]),
                Math.min(acc.sw[1], coord[1]),
              ],
            }),
            {
              ne: coords[0] as [number, number],
              sw: coords[0] as [number, number],
            },
          );
          cameraRef.current?.fitBounds(
            bounds.ne,
            bounds.sw,
            [60, 60, 60, 60],
            1000,
          );
        }
      } else {
        Alert.alert('Lỗi', 'Không tìm thấy đường đi');
      }
    } catch (err) {
      console.error(err);
      Alert.alert('Lỗi', 'Không thể lấy chỉ đường');
    } finally {
      setNavigationLoading(false);
    }
  };

  const clearRoute = () => {
    setRouteData(null);
  };

  return (
    <SubLayout title="Địa điểm thu gom" onBackPress={() => navigation.goBack()}>
      <View className="flex-1 bg-gray-50">
        {/* top strip removed per request */}

        {/* Map Legend */}
        <View
          className="absolute top-8 left-4 bg-white rounded-xl px-4 py-3 z-10"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 2 },
            shadowOpacity: 0.1,
            shadowRadius: 4,
            elevation: 3,
          }}
        >
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-full bg-green-500 items-center justify-center mr-2">
              <Icon name="navigation" size={12} color="white" />
            </View>
            <Text className="text-xs text-gray-700">Vị trí của tôi</Text>
          </View>
          <View className="flex-row items-center mb-2">
            <View className="w-6 h-6 rounded-full bg-purple-500 items-center justify-center mr-2">
              <Icon name="package" size={12} color="white" />
            </View>
            <Text className="text-xs text-gray-700">Các điểm thu</Text>
          </View>
        </View>

        {/* Actions moved into bottom sheet */}

        {/* Map with warehouse markers */}
        <View className="flex-1" style={{ backgroundColor: '#f0f0f0' }}>
          <MapboxGL.MapView
            ref={mapRef}
            style={{ flex: 1 }}
            styleURL={MapboxGL.StyleURL.Street}
            onPress={handleMapPress}
            logoEnabled={false}
            compassEnabled={true}
          >
            <MapboxGL.Camera
              ref={cameraRef}
              zoomLevel={12}
              centerCoordinate={
                currentLocation ? currentLocation : [106.7009, 10.7769]
              }
              animationDuration={1000}
            />

            {/* Vị trí hiện tại của bạn */}
            {currentLocation && (
              <MapboxGL.PointAnnotation
                id="my-location"
                coordinate={currentLocation}
              >
                <View
                  style={{
                    backgroundColor: '#10B981',
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 3,
                    borderColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                  }}
                >
                  <Icon name="navigation" size={20} color="white" />
                </View>
              </MapboxGL.PointAnnotation>
            )}

            {/* Warehouse markers */}
            {warehouses.map((wh, idx) => (
              <MapboxGL.PointAnnotation
                key={`${wh.id}-${selected === idx}`}
                id={`warehouse-${idx + 1}`}
                coordinate={[wh.lng, wh.lat]}
                onSelected={() => {
                  setSelected(idx);
                  if (!isExpanded) expandPanel();
                  cameraRef.current?.setCamera({
                    centerCoordinate: [wh.lng, wh.lat],
                    zoomLevel: 14,
                    animationDuration: 600,
                  });
                }}
              >
                <Animated.View
                  style={{
                    backgroundColor: selected === idx ? '#4169E1' : '#7C3AED',
                    borderRadius: 20,
                    width: 40,
                    height: 40,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 3,
                    borderColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                    transform: [{ scale: markerScales[idx] }],
                  }}
                >
                  <Icon name="package" size={20} color="white" />
                </Animated.View>
              </MapboxGL.PointAnnotation>
            ))}

            {/* Route line if available */}
            {routeData && routeData.geometry && (
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
          </MapboxGL.MapView>

          {/* My Location Button (floating) */}
          <TouchableOpacity
            className="absolute right-4 bottom-56 w-14 h-14 rounded-full bg-white items-center justify-center shadow-lg z-20"
            onPress={handleMyLocation}
            activeOpacity={0.8}
          >
            <Icon name="navigation" size={22} color="#1E40AF" />
          </TouchableOpacity>
        </View>

        {/* Draggable Bottom Panel */}
        {selected !== null && (
          <Animated.View
            className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl"
            style={{
              height: panelHeight,
              shadowColor: '#000',
              shadowOffset: { width: 0, height: -4 },
              shadowOpacity: 0.1,
              shadowRadius: 8,
              elevation: 10,
            }}
          >
            {/* Drag Handle */}
            <View
              className="items-center py-3 px-5"
              {...panResponder.panHandlers}
            >
              <View className="w-10 h-1 bg-gray-300 rounded-sm" />
            </View>

            {/* Scrollable Content */}
            <ScrollView
              className="flex-1"
              showsVerticalScrollIndicator={false}
              scrollEnabled={isExpanded}
            >
              <View className="px-5 pb-5">
                {/* Header */}
                <Text className="text-lg font-bold text-gray-900 mb-4">
                  Thông tin kho thu gom
                </Text>

                {/* Warehouse Item */}
                <View className="flex-row items-start mb-4">
                  <View className="w-10 h-10 rounded-full bg-purple-100 items-center justify-center mr-3">
                    <Icon name="package" size={20} color="#7C3AED" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 mb-1">
                      {selected !== null ? warehouses[selected].name : ''}
                    </Text>
                    <View className="flex-row items-center mb-2">
                      <Icon name="map-pin" size={14} color="#6B7280" />
                      <Text className="text-sm text-gray-500 ml-2">
                        {selected !== null ? warehouses[selected].address : ''}
                      </Text>
                    </View>
                    <View className="flex-row items-center">
                      <Text className="text-sm text-gray-500">Giờ mở cửa:</Text>
                      <Text className="text-sm font-semibold text-gray-900 ml-2">
                        {selected !== null
                          ? `${warehouses[selected].open} - ${warehouses[selected].close}`
                          : ''}
                      </Text>
                    </View>
                  </View>
                </View>

                {/* Show route summary when available */}
                {routeData && (
                  <View className="flex-row justify-between items-center mb-4">
                    <Text className="text-sm text-gray-500">Khoảng cách</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {(routeData.distance / 1000).toFixed(1)} km
                    </Text>
                    <Text className="text-sm text-gray-500">Thời gian</Text>
                    <Text className="text-sm font-semibold text-gray-900">
                      {Math.ceil(routeData.duration / 60)} phút
                    </Text>
                  </View>
                )}

                {isExpanded && (
                  <>
                    <View className="h-px bg-gray-200 my-4" />

                    <View className="mt-2">
                      {routeData ? (
                        <AppButton
                          title="Xóa chỉ đường"
                          onPress={clearRoute}
                          disabled={!routeData}
                          color="red"
                          className="w-full"
                        />
                      ) : (
                        <AppButton
                          title="Chỉ đường"
                          onPress={() =>
                            selected !== null && handleGetDirections(selected)
                          }
                          loading={navigationLoading}
                          disabled={
                            navigationLoading || currentLocation === null
                          }
                          className="w-full"
                        />
                      )}
                    </View>
                  </>
                )}
              </View>
            </ScrollView>
          </Animated.View>
        )}
      </View>
    </SubLayout>
  );
};

export default WarehouseLocationScreen;
