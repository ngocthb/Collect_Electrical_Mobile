import React, { useState } from 'react';
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
import { useEffect } from 'react';
import {
  getCurrentLocation,
  calculateDistance,
} from '../../services/mapboxService';
import SubLayout from '../../layout/SubLayout';
import { Warehouse } from '../../types/warehouse';
import { getWarehouses } from '../../services/warehouseService';

const WarehouseLocationScreen = () => {
  const [loading, setLoading] = useState(false);
  const [selectedRatingFilter, setSelectedRatingFilter] = useState<string>('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [sortByDistance, setSortByDistance] = useState<'none' | 'asc' | 'desc'>(
    'none',
  );
  const navigation = useNavigation<any>();
  const [warehouse, setWarehouse] = useState<Warehouse[]>([]);
  const ratingFilterOptions = [
    { value: '', label: 'Tất cả', color: 'gray' },
    { value: '4.5', label: '4.5+ sao', color: 'green' },
    { value: '4.0', label: '4.0+ sao', color: 'blue' },
    { value: '3.5', label: '3.5+ sao', color: 'yellow' },
  ];

  const [warehousesWithDistance, setWarehousesWithDistance] = useState(
    warehouse.map(w => ({
      ...w,
      distanceMeters: 0 as number,
      distanceText: '',
    })),
  );

  let filteredWarehouses = selectedRatingFilter
    ? warehousesWithDistance.filter(
        w => w.rating >= parseFloat(selectedRatingFilter),
      )
    : warehousesWithDistance;

  // Sort by distance if enabled (asc/desc)
  if (sortByDistance !== 'none') {
    filteredWarehouses = [...filteredWarehouses].sort((a, b) => {
      const distA = a.distanceMeters || 0;
      const distB = b.distanceMeters || 0;
      return sortByDistance === 'asc' ? distA - distB : distB - distA;
    });
  }

  const selectedOption = ratingFilterOptions.find(
    opt => opt.value === selectedRatingFilter,
  );

  const getColorClass = (color: string) => {
    const colorMap: Record<string, string> = {
      gray: 'bg-gray-400',
      blue: 'bg-blue-500',
      yellow: 'bg-amber-500',
      green: 'bg-green-500',
    };
    return colorMap[color] || 'bg-gray-400';
  };

  useEffect(() => {
    let mounted = true;

    const computeDistances = async () => {
      try {
        setLoading(true);
        const warehouse = await getWarehouses();
        if (!mounted) return;
        setWarehouse(warehouse);

        const loc = await getCurrentLocation();

        const [currLng, currLat] = loc || [null, null];

        const updated = warehouse.map(w => {
          if (currLat == null || currLng == null) {
            return { ...w, distanceMeters: 0, distanceText: '' };
          }
          const dist = calculateDistance(
            currLat,
            currLng,
            w.latitude,
            w.longitude,
          );
          const text =
            dist < 1000
              ? `${Math.round(dist)} m`
              : `${(dist / 1000).toFixed(1)} km`;
          return {
            ...w,
            distanceMeters: dist,
            distanceText: text,
            rating: 5,
          };
        });

        if (mounted) setWarehousesWithDistance(updated);
      } catch (e) {
        console.warn('Failed to get location or compute distances', e);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    computeDistances();

    return () => {
      mounted = false;
    };
  }, []);

  const renderStars = (rating: number) => {
    const fullStars = Math.floor(rating);
    const hasHalfStar = rating % 1 >= 0.5;
    const stars = [];

    for (let i = 0; i < fullStars; i++) {
      stars.push(
        <FontAwesome key={`full-${i}`} name="star" size={14} color="#F59E0B" />,
      );
    }

    if (hasHalfStar) {
      stars.push(
        <FontAwesome
          key="half"
          name="star-half-full"
          size={14}
          color="#F59E0B"
        />,
      );
    }

    const emptyStars = 5 - stars.length;
    for (let i = 0; i < emptyStars; i++) {
      stars.push(
        <FontAwesome
          key={`empty-${i}`}
          name="star"
          size={14}
          color="#D1D5DB"
        />,
      );
    }

    return stars;
  };

  const filterDropdown = (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setFilterDropdownOpen(!filterDropdownOpen)}
        className="flex-row items-center px-3 py-1.5 rounded-lg border border-gray-200 bg-primary-100"
      >
        <View
          className={`w-2 h-2 rounded-full mr-1.5 ${
            selectedOption?.color === 'gray'
              ? 'bg-white border border-gray-300'
              : getColorClass(selectedOption?.color || 'gray')
          }`}
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
            {ratingFilterOptions.map((option, index) => (
              <TouchableOpacity
                key={option.value}
                onPress={() => {
                  setSelectedRatingFilter(option.value);
                  setFilterDropdownOpen(false);
                }}
                className={`flex-row items-center px-3 py-2.5 ${
                  index < ratingFilterOptions.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                } ${
                  selectedRatingFilter === option.value
                    ? 'bg-gray-50'
                    : 'bg-white'
                }`}
              >
                <View
                  className={`w-2 h-2 rounded-full mr-2 ${getColorClass(
                    option.color,
                  )}`}
                />
                <Text
                  className={`text-[13px] text-gray-700 ${
                    selectedRatingFilter === option.value
                      ? 'font-semibold'
                      : 'font-normal'
                  }`}
                >
                  {option.label}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );

  return (
    <SubLayout
      title="Địa điểm thu gom"
      onBackPress={() => navigation.goBack()}
      rightComponent={
        <View className="flex-row items-center space-x-2">
          {filterDropdown}
          <TouchableOpacity
            onPress={() =>
              setSortByDistance(prev => (prev === 'asc' ? 'desc' : 'asc'))
            }
            className={`flex-row items-center justify-center py-2 px-3 rounded-lg border ml-2 ${
              sortByDistance !== 'none'
                ? 'bg-primary-100 border-primary-100'
                : 'bg-white border-gray-300'
            }`}
          >
            {sortByDistance === 'none' ? (
              <FontAwesome name="sort-amount-asc" size={13} color="#6B7280" />
            ) : (
              <FontAwesome
                name={
                  sortByDistance === 'asc'
                    ? 'sort-amount-asc'
                    : 'sort-amount-desc'
                }
                size={13}
                color={sortByDistance === 'asc' ? '#fff' : '#fff'}
              />
            )}
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
                <View className="flex-row items-start mb-3">
                  <View className="w-12 h-12 rounded-full bg-red-100 items-center justify-center mr-3">
                    <Icon name="compass" size={22} color="#e85a4f" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-bold text-primary-100 mb-1">
                      {wh.name}
                    </Text>
                    <View className="flex flex-row justify-between">
                      <View className="flex-row items-center">
                        {renderStars(wh.rating)}
                        <Text className="text-sm text-gray-600 ml-2">
                          {wh.rating.toFixed(1)}
                        </Text>
                      </View>
                      {wh.distanceText ? (
                        <Text className="text-sm text-gray-500 ">
                          Khoảng cách:{' '}
                          <Text className="font-semibold">
                            {wh.distanceText}
                          </Text>
                        </Text>
                      ) : null}
                    </View>
                  </View>
                  <View className=" ">
                    <TouchableOpacity
                      onPress={async () => {
                        try {
                          let url = '';
                          if (wh.latitude != null && wh.longitude != null) {
                            url = `https://www.google.com/maps/dir/?api=1&destination=${wh.latitude},${wh.longitude}`;
                          } else {
                            const dest = encodeURIComponent(
                              wh.address || wh.name,
                            );
                            url = `https://www.google.com/maps/dir/?api=1&destination=${dest}`;
                          }
                          const supported = await Linking.canOpenURL(url);
                          if (supported) {
                            await Linking.openURL(url);
                          } else {
                            const web =
                              wh.latitude != null && wh.longitude != null
                                ? `https://www.google.com/maps/search/?api=1&query=${wh.latitude},${wh.longitude}`
                                : `https://www.google.com/maps/search/?api=1&query=${encodeURIComponent(
                                    wh.address || wh.name,
                                  )}`;
                            await Linking.openURL(web);
                          }
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

                {/* Address */}
                <View className="flex-row items-start mb-2">
                  <Icon name="map-pin" size={16} color="#6B7280" />
                  <Text className="text-sm text-gray-600 ml-2 flex-1">
                    {wh.address}
                  </Text>
                </View>

                {/* Open hours */}
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
            ))
          )}
        </ScrollView>
      </View>
    </SubLayout>
  );
};

export default WarehouseLocationScreen;
