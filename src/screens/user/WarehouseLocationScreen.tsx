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

const WarehouseLocationScreen = () => {
  const navigation = useNavigation<any>();
  const [loading, setLoading] = useState(false);

  const [warehousesWithDistance, setWarehousesWithDistance] = useState<
    Warehouse[]
  >([]);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);

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
      const warehouseWithRating = warehouseData.map(wh => ({
        ...wh,
        rating: Math.random() * 2 + 3,
      }));

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

  const getColorClass = (color: string) => {
    const classes: any = {
      gray: 'bg-gray-400',
      blue: 'bg-blue-500',
      yellow: 'bg-amber-500',
      green: 'bg-green-500',
    };
    return classes[color] || 'bg-gray-400';
  };

  const renderStars = (rating: number) => {
    const full = Math.floor(rating);
    const half = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < full; i++)
      stars.push(
        <FontAwesome key={`full-${i}`} name="star" size={14} color="#F59E0B" />,
      );
    if (half)
      stars.push(
        <FontAwesome
          key="half"
          name="star-half-full"
          size={14}
          color="#F59E0B"
        />,
      );
    for (let i = stars.length; i < 5; i++)
      stars.push(
        <FontAwesome
          key={`empty-${i}`}
          name="star"
          size={14}
          color="#D1D5DB"
        />,
      );

    return stars;
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
                    <Text className="text-xs text-gray-600">
                      {wh?.rating?.toFixed(1)}
                    </Text>
                    <FontAwesome name="star" size={12} color="#F59E0B" />
                  </View>

                  <View className="flex-1">
                    <Text className="text-base font-bold text-primary-100 mb-1">
                      {wh.name}
                    </Text>
                    <View className="flex-row items-center">
                      <Icon name="clock" size={16} color="#6B7280" />
                      <Text className="text-sm text-gray-600 ml-2">
                        Giờ mở cửa:{' '}
                        <Text className="font-semibold text-gray-900">
                          {wh.openTime}
                        </Text>
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
