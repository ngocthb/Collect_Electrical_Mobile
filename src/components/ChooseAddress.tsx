import React, { useState, useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Modal,
  ScrollView,
} from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

import type { Address } from '../types/Address';

import { useAppDispatch, useAppSelector } from '../store/hooks';

interface ChooseAddressProps {
  selectedAddress: Address | null;
  onSelectAddress: (address: Address | null) => void;
}

const ChooseAddress: React.FC<ChooseAddressProps> = ({
  selectedAddress,
  onSelectAddress,
}) => {
  const addresses = useAppSelector(state => state.address.list);

  const [isLoading, setIsLoading] = useState(false);
  const [isModalVisible, setIsModalVisible] = useState(false);

  // Auto-select default address when component mounts or addresses change
  useEffect(() => {
    if (!selectedAddress && addresses && addresses.length > 0) {
      const defaultAddr = addresses.find(a => a.isDefault);
      if (defaultAddr) {
        onSelectAddress(defaultAddr);
      } else {
        onSelectAddress(addresses[0]);
      }
    }
  }, [addresses, selectedAddress, onSelectAddress]);

  const handleSelectAddress = (addr: Address) => {
    onSelectAddress(addr);
    setIsModalVisible(false);
  };

  return (
    <View className="mb-4">
      {isLoading ? (
        <ActivityIndicator size="large" color="#e85a4f" />
      ) : (
        <>
          <View className="flex-row justify-between mb-3 items-center">
            <Text className="text-sm font-semibold text-primary-100">
              Chọn địa chỉ<Text className="text-red-500"> *</Text>
            </Text>
          </View>

          {/* Display selected/default address */}
          {selectedAddress ? (
            <TouchableOpacity
              className="px-4 py-3 rounded-xl flex-row items-center justify-between bg-white border-2 border-red-200"
              activeOpacity={0.7}
              onPress={() => setIsModalVisible(true)}
            >
              <View className="flex-1 mr-2">
                <Text
                  className="text-sm text-text-sub font-medium"
                  numberOfLines={2}
                >
                  {selectedAddress.address}
                </Text>
              </View>
              <Icon name="chevron-down" size={20} color="#666" />
            </TouchableOpacity>
          ) : (
            <TouchableOpacity
              className="px-4 py-3 rounded-xl flex-row items-center justify-center bg-white border-2 border-dashed border-gray-300"
              activeOpacity={0.7}
              onPress={() => setIsModalVisible(true)}
            >
              <Icon name="map-pin" size={20} color="#666" />
              <Text className="text-sm text-gray-500 font-medium ml-2">
                Chọn địa chỉ
              </Text>
            </TouchableOpacity>
          )}

          {/* Modal for selecting address */}
          <Modal
            visible={isModalVisible}
            transparent
            animationType="fade"
            onRequestClose={() => setIsModalVisible(false)}
          >
            <View className="flex-1 bg-black/50 justify-center items-center px-4">
              <View className="bg-white rounded-3xl w-full max-w-md">
                {/* Header */}
                <View className="px-6 py-5 flex-row items-center justify-between mt-2">
                  <Text className="text-xl font-bold text-gray-800">
                    Chọn địa chỉ
                  </Text>
                  <TouchableOpacity
                    onPress={() => setIsModalVisible(false)}
                    className="w-8 h-8 rounded-full bg-gray-100 items-center justify-center"
                    activeOpacity={0.7}
                  >
                    <Icon name="x" size={20} color="#666" />
                  </TouchableOpacity>
                </View>

                {/* Address List */}
                <ScrollView
                  className="px-6 py-4 max-h-96"
                  contentContainerStyle={{ paddingBottom: 30 }}
                >
                  {addresses.map((addr, index) => (
                    <TouchableOpacity
                      key={addr.userAddressId}
                      className={`px-4 py-4 rounded-2xl mb-3 shadow-sm ${
                        selectedAddress?.userAddressId === addr.userAddressId
                          ? 'bg-red-50 border-2 border-red-400'
                          : 'bg-white border-2 border-gray-200'
                      }`}
                      activeOpacity={0.7}
                      onPress={() => handleSelectAddress(addr)}
                      style={{
                        elevation:
                          selectedAddress?.userAddressId === addr.userAddressId
                            ? 3
                            : 1,
                      }}
                    >
                      <View className="flex-row items-start">
                        <View className="flex-1">
                          <Text
                            className={`text-sm font-semibold mb-1 ${
                              selectedAddress?.userAddressId ===
                              addr.userAddressId
                                ? 'text-red-600'
                                : 'text-gray-800'
                            }`}
                            numberOfLines={3}
                          >
                            {addr.address}
                          </Text>
                        </View>
                        {selectedAddress?.userAddressId ===
                          addr.userAddressId && (
                          <View className="ml-2">
                            <Icon
                              name="check-circle"
                              size={22}
                              color="#e85a4f"
                            />
                          </View>
                        )}
                      </View>
                    </TouchableOpacity>
                  ))}
                </ScrollView>
              </View>
            </View>
          </Modal>
        </>
      )}
    </View>
  );
};

export default ChooseAddress;
