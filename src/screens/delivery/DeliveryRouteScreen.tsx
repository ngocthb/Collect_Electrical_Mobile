import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  ScrollView,
  Animated,
  PanResponder,
  Dimensions,
} from 'react-native';
import MapboxGL from '@rnmapbox/maps';
import Icon from 'react-native-vector-icons/Feather';
import {
  checkAndRequestLocationPermission,
  getCurrentLocation,
} from '../../services/mapboxService';
import type { Feature } from 'geojson';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/native';

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_HEIGHT = SCREEN_HEIGHT * 0.2;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.6;

// Dummy data for delivery schedule
const weekDays = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const todayIndex = new Date().getDay();

// Vị trí kho hàng (điểm xuất phát)
const warehouseLocation = {
  lat: 10.8411,
  lng: 106.8283,
  name: 'Kho hàng chính',
  address: 'Vinhomes Grand Park, Long Thạnh Mỹ, Thủ Đức',
};

const deliveries = [
  {
    id: 1,
    name: 'Điện thoại',
    address: 'S1.01 Vinhomes Grand Park, Thủ Đức',
    detail: 'Giao trong nội khu S1, gần công viên trung tâm',
    customer: 'Nguyễn Văn A',
    phone: '0901234567',
    lat: 10.8423,
    lng: 106.8297,
  },
  {
    id: 2,
    name: 'Laptop',
    address: 'S3.05 Vinhomes Grand Park, Thủ Đức',
    detail: 'Tòa S3.05, khu The Rainbow',
    customer: 'Trần Thị B',
    phone: '0907654321',
    lat: 10.8398,
    lng: 106.8264,
  },
  {
    id: 3,
    name: 'Tủ lạnh',
    address: 'The Origami, Vinhomes Grand Park, Thủ Đức',
    detail: 'Khu Origami, tòa O-B2',
    customer: 'Lê Văn C',
    phone: '0909876543',
    lat: 10.8437,
    lng: 106.8312,
  },
];

const DeliveryRouteScreen = () => {
  const [selected, setSelected] = useState<number | null>(null);
  const [isExpanded, setIsExpanded] = useState(false);
  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | null
  >(null);
  const [selectedDayIndex, setSelectedDayIndex] = useState<number>(todayIndex);
  const panelHeight = useRef(new Animated.Value(MIN_HEIGHT)).current;
  const navigation = useNavigation<any>();

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

  // Handle map press to detect marker clicks
  const handleMapPress = (feature: Feature) => {
    console.log('Map pressed:', feature);
    if (!feature?.properties?.id) return;

    // Check if it's a delivery marker
    if (feature.properties.id.startsWith('delivery-')) {
      const markerIndex =
        parseInt(feature.properties.id.replace('delivery-', '')) - 1;
      console.log('Marker index:', markerIndex);
      if (markerIndex >= 0 && markerIndex < deliveries.length) {
        setSelected(markerIndex);
        if (!isExpanded) {
          expandPanel();
        }
      }
    }
  };

  // Auto select first delivery on mount
  React.useEffect(() => {
    setSelected(0);
  }, []);

  return (
    <SubLayout
      title="Lộ trình giao hàng"
      onBackPress={() => navigation.goBack()}
    >
      <View className="flex-1 bg-gray-50">
        {/* Week Calendar */}
        <View className="flex-row justify-between px-4 py-3 bg-white border-b border-gray-200">
          {weekDays.map((d, i) => (
            <View
              key={d}
              className={`items-center px-2 py-1 ${
                i === selectedDayIndex ? 'bg-blue-100 rounded-xl' : ''
              }`}
            >
              <Text
                className={`text-xs font-bold ${
                  i === selectedDayIndex ? 'text-blue-600' : 'text-gray-500'
                }`}
                onPress={() => setSelectedDayIndex(i)}
                style={{ paddingHorizontal: 8, paddingVertical: 2 }}
              >
                {d}
              </Text>
              {i === todayIndex && (
                <Text className="text-xs text-blue-600 mt-0.5">Hôm nay</Text>
              )}
            </View>
          ))}
        </View>

        {/* Map Legend */}
        <View
          className="absolute top-28 left-4 bg-white rounded-xl px-4 py-3 z-10"
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
            <Text className="text-xs text-gray-700">Kho hàng</Text>
          </View>
          <View className="flex-row items-center">
            <View className="w-6 h-6 rounded-full bg-blue-600 items-center justify-center mr-2">
              <Text className="text-white font-bold text-[10px]">1</Text>
            </View>
            <Text className="text-xs text-gray-700">Điểm giao hàng</Text>
          </View>
        </View>

        {/* Map with delivery markers */}
        <View className="flex-1" style={{ backgroundColor: '#f0f0f0' }}>
          <MapboxGL.MapView
            style={{ flex: 1 }}
            styleURL={MapboxGL.StyleURL.Street}
            onPress={handleMapPress}
            logoEnabled={false}
            compassEnabled={true}
          >
            <MapboxGL.Camera
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

            {/* Vị trí kho hàng */}
            <MapboxGL.PointAnnotation
              id="warehouse"
              coordinate={[warehouseLocation.lng, warehouseLocation.lat]}
            >
              <View
                style={{
                  backgroundColor: '#8B5CF6',
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
                <Icon name="package" size={20} color="white" />
              </View>
            </MapboxGL.PointAnnotation>

            {/* Các điểm giao hàng */}
            {deliveries.map((item, idx) => (
              <MapboxGL.PointAnnotation
                key={item.id.toString()}
                id={`delivery-${idx + 1}`}
                coordinate={[item.lng, item.lat]}
                onSelected={() => {
                  console.log('Marker selected:', idx);
                  setSelected(idx);
                  if (!isExpanded) {
                    expandPanel();
                  }
                }}
              >
                <View
                  style={{
                    backgroundColor: selected === idx ? '#1E40AF' : '#2563EB',
                    borderRadius: 16,
                    width: 32,
                    height: 32,
                    alignItems: 'center',
                    justifyContent: 'center',
                    borderWidth: 2,
                    borderColor: 'white',
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 2 },
                    shadowOpacity: 0.3,
                    shadowRadius: 4,
                  }}
                >
                  <Text
                    style={{ color: 'white', fontWeight: 'bold', fontSize: 14 }}
                  >
                    {idx + 1}
                  </Text>
                </View>
              </MapboxGL.PointAnnotation>
            ))}
          </MapboxGL.MapView>
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
                  Thông tin giao hàng
                </Text>

                {/* Delivery Item */}
                <View className="flex-row items-start mb-4">
                  <View className="w-8 h-8 rounded-full bg-blue-100 items-center justify-center mr-3">
                    <Text className="text-blue-600 font-bold text-sm">
                      {selected + 1}
                    </Text>
                  </View>
                  <View className="flex-1">
                    <Text className="text-xs text-gray-500 mb-1">
                      Vật phẩm thu gom
                    </Text>
                    <Text className="text-base font-semibold text-gray-900 mb-0.5">
                      {deliveries[selected].name}
                    </Text>
                    <View className="flex-row items-center">
                      <Icon name="map-pin" size={14} color="#6B7280" />
                      <Text className="text-sm text-gray-500 ml-1">
                        {deliveries[selected].address}
                      </Text>
                    </View>
                    <Text className="text-xs text-gray-400 mt-1">
                      {deliveries[selected].detail}
                    </Text>
                  </View>
                </View>

                {isExpanded && (
                  <>
                    {/* Divider */}
                    <View className="h-px bg-gray-200 my-4" />

                    {/* Customer Info */}
                    <View className="mb-4">
                      <Text className="text-xs text-gray-500 mb-3">
                        Thông tin khách hàng
                      </Text>
                      <View className="flex-row items-center bg-gray-50 rounded-2xl p-4">
                        <View className="w-14 h-14 rounded-full bg-blue-100 items-center justify-center mr-3">
                          <Icon name="user" size={28} color="#3B82F6" />
                        </View>
                        <View className="flex-1">
                          <Text className="text-base font-bold text-gray-900">
                            {deliveries[selected].customer}
                          </Text>
                        </View>
                      </View>
                    </View>

                    {/* Order Details */}
                    <View className="mb-4">
                      <Text className="text-xs text-gray-500 mb-3">
                        Chi tiết lộ trình
                      </Text>
                      <View className="gap-2">
                        <View className="flex-row justify-between py-2">
                          <Text className="text-sm text-gray-500">
                            Thứ tự giao hàng
                          </Text>
                          <Text className="text-sm font-semibold text-gray-900">
                            #{selected + 1} / {deliveries.length}
                          </Text>
                        </View>
                        <View className="flex-row justify-between py-2">
                          <Text className="text-sm text-gray-500">
                            Khoảng cách dự kiến
                          </Text>
                          <Text className="text-sm font-semibold text-gray-900">
                            {(Math.random() * 10 + 5).toFixed(1)} km
                          </Text>
                        </View>
                        <View className="flex-row justify-between py-2">
                          <Text className="text-sm text-gray-500">
                            Thời gian dự kiến
                          </Text>
                          <Text className="text-sm font-semibold text-gray-900">
                            {Math.floor(Math.random() * 20 + 15)} phút
                          </Text>
                        </View>
                      </View>
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

export default DeliveryRouteScreen;
