import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MainLayout from '../../layout/MainLayout';
import { useNavigation } from '@react-navigation/native';
import AppAvatar from '../../components/ui/AppAvatar';
import { useAppSelector } from '../../store/hooks';
import React, { useEffect, useState } from 'react';
import { getUserPoints } from '../../services/pointsService';

const menuItems = [
  { id: 1, title: 'Hồ sơ của tôi', icon: 'user', color: '#4169E1' },
  { id: 7, title: 'QR của tôi', icon: 'maximize', color: '#7C3AED' },
  { id: 2, title: 'Ví của tôi', icon: 'credit-card', color: '#F59E0B' },
  { id: 3, title: 'Lịch thu gom mặc định', icon: 'calendar', color: '#3B82F6' },
  { id: 5, title: 'Thống kê', icon: 'bar-chart-2', color: '#F97316' },
  { id: 6, title: 'Địa chỉ mặc định', icon: 'map-pin', color: '#059669' },
  { id: 4, title: 'Đổi mật khẩu', icon: 'lock', color: '#EF4444' },
];

const ProfileScreen = () => {
  const { user, role } = useAppSelector(s => s.auth);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const isUser = String(role ?? '').toLowerCase() === 'user';

  useEffect(() => {
    let mounted = true;
    (async () => {
      if (!isUser) return;
      const userId = user?.userId;
      if (!userId) return;
      try {
        setLoading(true);
        const res = await getUserPoints(userId);
        if (!mounted) return;
        if (res && typeof res.points === 'number') setBalance(res.points);
      } catch (e) {
        console.warn('[Profile] Failed to load points', e);
      } finally {
        if (mounted) setLoading(false);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [isUser, user]);

  const filteredMenu = menuItems.filter(item => {
    // Hide wallet, schedule, default address for delivery users
    if (role === 'delivery' && [2, 3, 6].includes(item.id)) {
      return false;
    }
    // Hide stats for non-delivery users
    if (role !== 'delivery' && item.id === 5) {
      return false;
    }
    // Only allow MyQr (id:7) for normal users
    if (item.id === 7 && role !== 'user') {
      return false;
    }
    return true;
  });

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
      case 7:
        navigation.navigate('MyQr');
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
            <View className="relative bg-secondary-100 rounded-full p-1">
              <AppAvatar
                name={user?.name}
                uri={user?.avatar ?? null}
                size={80}
                style={{ borderWidth: 4, borderColor: '#fff' }}
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
                  <Text className="text-base font-bold text-primary-100 mr-2">
                    {isUser &&
                      (loading ? (
                        <ActivityIndicator color="#000" />
                      ) : (
                        `${(balance ?? 0).toLocaleString()}`
                      ))}
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
                <Icon name={item.icon} size={24} color={item.color || '#333'} />
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
