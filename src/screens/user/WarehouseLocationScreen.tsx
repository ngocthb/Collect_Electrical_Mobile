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
import FontAwesome from 'react-native-vector-icons/FontAwesome';
import { useNavigation } from '@react-navigation/native';

import SubLayout from '../../layout/SubLayout';
import { Warehouse } from '../../types/Warehouse';
import { getWarehouses } from '../../services/warehouseService';
const DISTANCE = 10000;
import {
  calculateDistance,
  getCurrentLocation,
} from '../../services/mapboxService';

const WarehouseLocationScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const [warehousesWithDistance, setWarehousesWithDistance] = useState<
    Warehouse[]
  >([]);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortOrder, setSortOrder] = useState<'asc' | 'desc'>('asc'); // 'asc' = gần nhất, 'desc' = xa nhất

  const ratingFilterOptions = [
    { value: '', label: 'Tất cả', color: 'gray' },
    { value: '4.5', label: '4.5+ sao', color: 'green' },
    { value: '4.0', label: '4.0+ sao', color: 'blue' },
    { value: '3.5', label: '3.5+ sao', color: 'yellow' },
  ];

  const loadWarehouses = async () => {
    try {
      setLoading(true);

      const warehouseData = await getWarehouses();
      const [longitude, latitude] = await getCurrentLocation();

      const warehouse = warehouseData.map(wh => ({
        ...wh,
        rating: Math.random() * 2 + 3,

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
  let filteredWarehouses =
    selectedRatingFilter === ''
      ? warehousesWithDistance
      : warehousesWithDistance.filter(
          w => w.rating >= parseFloat(selectedRatingFilter),
        );

  // Sort theo khoảng cách
  filteredWarehouses = [...filteredWarehouses].sort((a, b) => {
    if (sortOrder === 'asc') {
      return (a.distanceMeters || 0) - (b.distanceMeters || 0); // Gần nhất đến xa nhất
    } else {
      return (b.distanceMeters || 0) - (a.distanceMeters || 0); // Xa nhất đến gần nhất
    }
  });

  const getColorClass = (color: string) => {
    const classes: any = {
      gray: 'bg-gray-400',
      blue: 'bg-blue-500',
      yellow: 'bg-amber-500',
      green: 'bg-green-500',
    };
    return classes[color] || 'bg-gray-400';
  };

  const selectedOption = ratingFilterOptions.find(
    r => r.value === selectedRatingFilter,
  );

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

          {/* FILTER DROPDOWN */}
          <View className="relative">
            <TouchableOpacity
              onPress={() => setFilterDropdownOpen(!filterDropdownOpen)}
              className="flex-row items-center px-3 py-1.5 rounded-lg border border-gray-200 bg-primary-100"
            >
              <View
                className={`w-2 h-2 rounded-full mr-1.5 ${getColorClass(
                  selectedOption?.color || 'gray',
                )}`}
              />
              <Text className="text-xs font-medium text-white mr-2">
                {selectedOption?.label || 'Tất cả'}
              </Text>
              <IconIon name="funnel-outline" size={16} color="#fff" />
            </TouchableOpacity>

            {filterDropdownOpen && (
              <>
                <TouchableOpacity
                  style={{
                    position: 'absolute',
                    top: -1000,
                    left: -1000,
                    right: -1000,
                    bottom: -1000,
                    zIndex: 998,
                  }}
                  activeOpacity={1}
                  onPress={() => setFilterDropdownOpen(false)}
                />

                <View
                  className="absolute top-11 right-0 w-40 bg-white rounded-lg border border-gray-200 shadow-lg"
                  style={{ zIndex: 999, elevation: 5 }}
                >
                  {ratingFilterOptions.map(option => (
                    <TouchableOpacity
                      key={option.value}
                      onPress={() => {
                        setSelectedRatingFilter(option.value);
                        setFilterDropdownOpen(false);
                      }}
                      className="flex-row items-center px-3 py-2 border-b border-gray-100"
                    >
                      <View
                        className={`w-2 h-2 rounded-full mr-2 ${getColorClass(
                          option.color,
                        )}`}
                      />
                      <Text className="text-[13px] text-gray-700">
                        {option.label}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </>
            )}
          </View>
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
                <View className="flex-row items-start">
                  <View className="flex-row w-12 h-12 rounded-full bg-red-100 items-center justify-center mr-3">
                    <Text className="text-xs text-gray-600 ">
                      {wh?.rating?.toFixed(1)}
                    </Text>
                    <FontAwesome name="star" size={12} color="#F59E0B" />
                  </View>

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
                    className="w-10 h-10 rounded-full items-center justify-center bg-primary-100 border-2 border-red-200"
                  >
                    <Icon name="navigation" size={18} color="#fff" />
                  </TouchableOpacity>
                </View>
              </View>
            ))
          )}
        </ScrollView>
      </View>
    </SubLayout>
  );
};

export default WarehouseLocationScreen;
