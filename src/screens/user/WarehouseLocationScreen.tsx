import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  Linking,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconIon from 'react-native-vector-icons/Ionicons';

import { useNavigation } from '@react-navigation/native';
import toast from 'react-native-toast-message';

import SubLayout from '../../layout/SubLayout';
import { Warehouse } from '../../types/Warehouse';
import { getWarehouses } from '../../services/warehouseService';
const DISTANCE = 10000;
import {
  checkAndRequestLocationPermission,
  calculateDistance,
  getCurrentLocation,
} from '../../services/mapboxService';

const WarehouseLocationScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const [warehousesWithDistance, setWarehousesWithDistance] = useState<
    Warehouse[]
  >([]);
  const [selectedDistanceFilter, setSelectedDistanceFilter] = useState('all');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // 'asc' = gần nhất, 'desc' = xa nhất
  const [expandedWarehouseId, setExpandedWarehouseId] = useState<string | null>(
    null,
  );

  const distanceFilterOptions = [
    { value: 'all', label: 'Tất cả', color: 'gray', min: 0, max: Infinity },
    { value: '0-5', label: '0 - 5 km', color: 'green', min: 0, max: 5000 },
    { value: '5-10', label: '5 - 10 km', color: 'blue', min: 5000, max: 10000 },
    {
      value: '10-15',
      label: '10 - 15 km',
      color: 'yellow',
      min: 10000,
      max: 15000,
    },
    { value: '15+', label: '15 km+', color: 'red', min: 15000, max: Infinity },
  ];

  const loadWarehouses = async () => {
    try {
      setLoading(true);
      const granted = await checkAndRequestLocationPermission();
      if (!granted) {
        toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Quyền truy cập vị trí bị từ chối',
        });
        return;
      }
      const warehouseData = await getWarehouses();
      const [longitude, latitude] = await getCurrentLocation();

      const warehouse = warehouseData.map(wh => ({
        ...wh,
        distanceMeters: calculateDistance(
          latitude,
          longitude,
          wh.latitude,
          wh.longitude,
        ),
      }));

      const warehouseWithRating = warehouse.filter(
        wh => wh.distanceMeters <= DISTANCE,
      );

      setWarehousesWithDistance(warehouseWithRating);
    } catch (error) {
      console.warn('Error loading warehouses:', error);
    } finally {
      setLoading(false);
    }
  };

  useEffect(() => {
    loadWarehouses();
  }, []);

  // ---------------------------
  // FILTER + SORT
  // ---------------------------
  const selectedDistanceOption = distanceFilterOptions.find(
    d => d.value === selectedDistanceFilter,
  );
  let filteredWarehouses = warehousesWithDistance.filter(wh => {
    const distance = wh.distanceMeters || 0;
    return (
      distance >= selectedDistanceOption!.min &&
      distance <= selectedDistanceOption!.max
    );
  });

  // Sort theo khoảng cách
  filteredWarehouses = [...filteredWarehouses].sort((a, b) => {
    if (sortOrder === 'asc') {
      return (a.distanceMeters || 0) - (b.distanceMeters || 0); // Gần nhất đến xa nhất
    } else {
      return (b.distanceMeters || 0) - (a.distanceMeters || 0); // Xa nhất đến gần nhất
    }
  });

  return (
    <SubLayout
      title="Địa điểm thu gom"
      onBackPress={() => navigation.goBack()}
      rightComponent={
        <View className="flex-row items-center space-x-2">
          {/* SORT BUTTON */}
          <TouchableOpacity
            onPress={() => setSortOrder(sortOrder === 'asc' ? 'desc' : 'asc')}
            className="flex-row items-center px-3 py-1.5 rounded-lg border border-gray-200 bg-white mr-2"
          >
            <Icon
              name={sortOrder === 'asc' ? 'chevrons-up' : 'chevrons-down'}
              size={14}
              color="#e85a4f"
            />
          </TouchableOpacity>
        </View>
      }
    >
      <View className="flex-1 bg-background-50">
        <ScrollView className="flex-1 px-4 mt-2">
          {loading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#e85a4f" />
              <Text className="text-gray-500 mt-4 text-center">
                Đang tải...
              </Text>
            </View>
          ) : filteredWarehouses.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Icon name="inbox" size={64} color="#DDD" />
              <Text className="text-gray-500 mt-4 text-center">
                Không có địa điểm nào
              </Text>
            </View>
          ) : (
            filteredWarehouses.map(wh => (
              <View
                key={wh.id}
                className="bg-white border-2 border-red-200 rounded-xl p-4 mb-3 shadow-sm"
              >
                {/* HEADER */}
                <View className="flex-row items-start justify-between mb-3">
                  <View className="flex-1">
                    <Text className="text-base font-bold text-primary-100 mb-1">
                      {wh.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Icon name="clock" size={12} color="#6B7280" />

                      <Text className="text-sm text-gray-600 ml-1 mr-2">
                        {wh.openTime}
                      </Text>
                      <Icon name="minus" size={12} color="#6B7280" />
                      <Text className="text-sm text-gray-600 ml-1 ">
                        {((wh.distanceMeters || 0) / 1000).toFixed(0)} km
                      </Text>
                    </View>
                  </View>

                  <TouchableOpacity
                    onPress={async () => {
                      try {
                        const url = `https://www.google.com/maps/dir/?api=1&destination=${wh.latitude},${wh.longitude}`;
                        const supported = await Linking.canOpenURL(url);
                        await Linking.openURL(url);
                      } catch (e) {
                        console.warn('Cannot open maps', e);
                      }
                    }}
                    className="w-10 h-10 rounded-full items-center justify-center bg-primary-100 border-2 border-red-200 ml-2"
                  >
                    <Icon name="navigation" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>

                {/* ACCEPTED CATEGORIES */}
                {wh.acceptedCategories && wh.acceptedCategories.length > 0 && (
                  <View className="border-t border-gray-200 pt-3">
                    <View className="flex-row items-center justify-between mb-2">
                      <Text className="text-xs font-semibold text-gray-700">
                        Danh mục chấp nhận ({wh.acceptedCategories.length}):
                      </Text>
                      {wh.acceptedCategories.length > 3 && (
                        <TouchableOpacity
                          onPress={() =>
                            setExpandedWarehouseId(
                              expandedWarehouseId === wh.id ? null : wh.id,
                            )
                          }
                          className="p-1"
                        >
                          <Icon
                            name={
                              expandedWarehouseId === wh.id
                                ? 'chevron-up'
                                : 'chevron-down'
                            }
                            size={16}
                            color="#3b82f6"
                          />
                        </TouchableOpacity>
                      )}
                    </View>

                    {/* First row of categories */}
                    <View className="flex-row flex-wrap gap-1.5 mb-2">
                      {wh.acceptedCategories
                        .slice(0, 3)
                        .map((category: any) => (
                          <View
                            key={category.id}
                            className="bg-blue-100 rounded-full px-2.5 py-1"
                          >
                            <Text className="text-xs text-blue-700 font-medium">
                              {category.name}
                            </Text>
                          </View>
                        ))}
                    </View>

                    {/* Expanded categories */}
                    {expandedWarehouseId === wh.id && (
                      <View className="flex-row flex-wrap gap-1.5 mt-2 pt-2 border-t border-gray-100">
                        {wh.acceptedCategories.slice(3).map((category: any) => (
                          <View
                            key={category.id}
                            className="bg-blue-100 rounded-full px-2.5 py-1"
                          >
                            <Text className="text-xs text-blue-700 font-medium">
                              {category.name}
                            </Text>
                          </View>
                        ))}
                      </View>
                    )}
                  </View>
                )}
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SubLayout>
  );
};

export default WarehouseLocationScreen;
