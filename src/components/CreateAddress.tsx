import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  TextInput,
  TouchableOpacity,
  Text,
  ActivityIndicator,
  Keyboard,
  Dimensions,
} from 'react-native';
import toast from 'react-native-toast-message';

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
  OpenMapAutocompleteResult,
} from '../types/MapboxPicker';

import { ScrollView } from 'react-native-gesture-handler';

import ConfirmModal from './ConfirmModal';

interface CreateAddressProps {
  onLocationSelect: (location: LocationData) => Promise<void> | void;
}
const { width, height } = Dimensions.get('window');
const CreateAddress: React.FC<CreateAddressProps> = ({ onLocationSelect }) => {
  const [searchQuery, setSearchQuery] = useState<string>('');
  const [searchResults, setSearchResults] = useState<
    OpenMapAutocompleteResult[]
  >([]);
  const [loading, setLoading] = useState<boolean>(false);
  const [isGetLocation, setIsGetLocation] = useState<boolean>(false);
  const [confirmModalVisible, setConfirmModalVisible] =
    useState<boolean>(false);
  const [pendingLocation, setPendingLocation] = useState<LocationData | null>(
    null,
  );

  const searchTimeoutRef = useRef<number | null>(null);

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
      setPendingLocation(addressDetails);
      setConfirmModalVisible(true);
    } catch (error) {
      console.error('Error resolving place:', error);
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể lấy thông tin địa điểm',
      });
    }
  };

  const handleMyLocation = async () => {
    const granted = await checkAndRequestLocationPermission();
    if (!granted) {
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Quyền truy cập vị trí bị từ chối',
      });
      return;
    }

    setIsGetLocation(true);
    setLoading(true);
    try {
      const location = await getCurrentLocation();
      if (location) {
        const [longitude, latitude] = location;
        const addressResults = await reverseGeocodeService(longitude, latitude);
        if (addressResults) {
          setPendingLocation(addressResults);
          setConfirmModalVisible(true);
        }
      } else {
        toast.show({
          type: 'error',
          text1: 'Lỗi',
          text2: 'Không thể lấy vị trí hiện tại',
        });
      }
    } catch (error) {
      console.error('Error getting current location:', error);
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: 'Không thể lấy vị trí hiện tại',
      });
    } finally {
      setLoading(false);
      setIsGetLocation(false);
    }
  };

  return (
    <View className="flex-1 bg-gray-50">
      <View className="">
        <View className="mx-4 mb-3 flex-row items-center bg-gray-100  border-2 border-red-200 rounded-2xl px-4 py-3">
          <Icon name="search" size={22} color="#e85a4f" />
          <TextInput
            className="flex-1 ml-3 text-base text-gray-900 font-medium"
            placeholder={
              isGetLocation
                ? 'Đang lấy vị trí của bạn'
                : 'Tìm kiếm địa điểm ...'
            }
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

          <TouchableOpacity
            onPress={handleMyLocation}
            activeOpacity={0.7}
            className="ml-2 bg-red-50 rounded-full p-2"
          >
            <Icon name="my-location" size={20} color="#e85a4f" />
          </TouchableOpacity>
        </View>
      </View>

      {/* Search Results */}
      {searchQuery.length > 0 && !loading && (
        <ScrollView
          showsVerticalScrollIndicator={false}
          className="flex-1"
          style={{ maxHeight: height - 200 }}
        >
          {searchResults.length > 0 ? (
            <View className="mt-2">
              {searchResults.map((item, index) => (
                <TouchableOpacity
                  key={index}
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

      {/* Confirmation Modal */}
      <ConfirmModal
        visible={confirmModalVisible}
        title="Xác nhận địa điểm"
        message={`Bạn có chắc muốn chọn địa điểm:\n"${pendingLocation?.name}"?`}
        confirmText="Xác nhận"
        cancelText="Hủy"
        onConfirm={() => {
          if (pendingLocation) {
            setPendingLocation(null);
            onLocationSelect(pendingLocation);
          }
          setConfirmModalVisible(false);
        }}
        onCancel={() => {
          setPendingLocation(null);
          setConfirmModalVisible(false);
        }}
        iconName="map-pin"
        iconColor="#e85a4f"
      />
    </View>
  );
};

export default CreateAddress;
