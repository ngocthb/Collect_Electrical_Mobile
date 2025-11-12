import React from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MainLayout from '../../layout/MainLayout';
import { useNavigation } from '@react-navigation/native';
import AppAvatar from '../../components/ui/AppAvatar';
import { useAppSelector } from '../../store/hooks';

const menuItems = [
  { id: 1, title: 'Hồ sơ của tôi', icon: 'user' },
  { id: 2, title: 'Ví của tôi', icon: 'credit-card' },
  { id: 3, title: 'Lịch thu gom mặc định', icon: 'calendar' },
  { id: 5, title: 'Thống kê', icon: 'bar-chart-2' },
  { id: 6, title: 'Địa chỉ mặc định', icon: 'map-pin' },
  { id: 4, title: 'Đổi mật khẩu', icon: 'lock' },
];

const ProfileScreen = () => {
  const { user, role } = useAppSelector(s => s.auth);

  const filteredMenu = menuItems.filter(
    item => !(role === 'delivery' && [2, 3, 6].includes(item.id)),
  );

  const navigation = useNavigation<any>();

  const handleMenuPress = (id: number) => {
    switch (id) {
      case 1:
        navigation.navigate('EditProfile');
        break;
      case 2:
        navigation.navigate('Wallet');
        break;
      case 3:
        navigation.navigate('DefaultSchedule');
        break;
      case 4:
        navigation.navigate('ChangePassword');
        break;
      case 5:
        navigation.navigate('Statistics');
        break;
      case 6:
        navigation.navigate('DefaultAddress');
        break;
      default:
        // no-op (future handlers)
        break;
    }
  };

  return (
    <MainLayout>
      <View className="flex-1 bg-white">
        <ScrollView className="flex-1 px-6">
          {/* Profile Section */}
          <View className="flex-row items-center  ">
            <View>
              <AppAvatar
                name={user?.name ?? 'User'}
                uri={user?.avatar ?? undefined}
                size={80}
                style={{ marginBottom: 8 }}
              />
            </View>

            <View className="flex ml-4 justify-center">
              <Text className="text-lg font-bold text-gray-800">
                {user?.name ?? 'Khách hàng'}
              </Text>
              <Text className="text-sm text-gray-500">
                {user?.email ?? '—'}
              </Text>
              {role !== 'delivery' && (
                <View className="flex-row items-center mt-2">
                  <Text className="text-base font-bold text-gray-800 mr-2">
                    220
                  </Text>
                  <View className="w-6 h-6 bg-yellow-400 rounded-full items-center justify-center">
                    <Text className="text-xs">🪙</Text>
                  </View>
                </View>
              )}
            </View>
          </View>

          {/* Menu Items */}
          <View className="py-4">
            {filteredMenu.map(item => (
              <TouchableOpacity
                key={item.id}
                className="flex-row items-center py-6 "
                onPress={() => handleMenuPress(item.id)}
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

export default ProfileScreen;
