import React from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MainLayout from '../../layout/MainLayout';

const avatar = require('../../assets/images/avatar.jpg');

const menuItems = [
  { id: 1, title: 'Hồ sơ của tôi', icon: 'user' },
  { id: 2, title: 'Ví của tôi', icon: 'credit-card' },
  { id: 3, title: 'Lịch thu gom mặc định', icon: 'calendar' },
  { id: 4, title: 'Đổi mật khẩu', icon: 'lock' },
  { id: 5, title: 'Cài đặt', icon: 'settings' },
];

const ProfileDeliveryScreen = () => {
  return (
    <MainLayout>
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1 px-6">
          {/* Profile Section */}
          <View className="flex-row items-center  ">
            <Image
              source={avatar}
              className="w-24 h-24 rounded-full mb-4"
              resizeMode="cover"
            />
            <View className="flex ml-4 justify-center">
              <Text className="text-lg font-bold text-gray-800">Naruto</Text>
              <Text className="text-sm text-gray-500">mosalah@gmail.com</Text>
              <View className="flex-row items-center mt-2">
                <Text className="text-base font-bold text-gray-800 mr-2">
                  220
                </Text>
                <View className="w-6 h-6 bg-yellow-400 rounded-full items-center justify-center">
                  <Text className="text-xs">🪙</Text>
                </View>
              </View>
            </View>
          </View>

          {/* Menu Items */}
          <View className="py-4">
            {menuItems.map(item => (
              <TouchableOpacity
                key={item.id}
                className="flex-row items-center py-6 "
              >
                <Icon name={item.icon} size={24} color="#333" />
                <Text className="ml-4 text-base text-text-sub">
                  {item.title}
                </Text>
                <View className="flex-1" />
                <Icon name="chevron-right" size={24} color="#999" />
              </TouchableOpacity>
            ))}
          </View>
        </ScrollView>
      </View>
    </MainLayout>
  );
};

export default ProfileDeliveryScreen;
