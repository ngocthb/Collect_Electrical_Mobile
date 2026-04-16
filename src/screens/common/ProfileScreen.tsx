import {
  View,
  Text,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
  Dimensions,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MainLayout from '../../layout/MainLayout';
import { useNavigation } from '@react-navigation/native';
import AppAvatar from '../../components/ui/AppAvatar';
import { useAppSelector } from '../../store/hooks';
import React, { useEffect, useState } from 'react';
import { getUserPoints } from '../../services/pointsService';
import { uninitZegoService } from '../../config/zego';
import { logout } from '../../store/slices/authSlice';
import { signOut } from '../../services/authService';
import { useAppDispatch } from '../../store/hooks';
import Toast from 'react-native-toast-message';

const menuItems = [
  { id: 1, title: 'Hồ sơ của tôi', icon: 'user', color: '#3366FF' },
  { id: 2, title: 'QR của tôi', icon: 'maximize', color: '#7C3AED' },
  { id: 3, title: 'Kho điểm xanh', icon: 'credit-card', color: '#F59E0B' },
  { id: 4, title: 'Lịch thu gom mặc định', icon: 'calendar', color: '#e85a4f' },
  { id: 5, title: 'Thống kê', icon: 'bar-chart-2', color: '#F97316' },
  { id: 6, title: 'Thông tin địa chỉ', icon: 'map-pin', color: '#059669' },
];

const { width, height } = Dimensions.get('window');

const ProfileScreen = () => {
  const { user } = useAppSelector(s => s.auth);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  
  const isUser = String(user?.role ?? '').toLowerCase() === 'user';
  const dispatch = useAppDispatch();
  console.log(user);




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
    if (isUser) {
      return [1, 2, 3, 6].includes(item.id);
    }

    return [1, 5].includes(item.id);
  });

  const navigation = useNavigation<any>();

  const handleMenuPress = (id: number) => {
    switch (id) {
      case 1:
        navigation.navigate('EditProfile');
        break;
      case 2:
        if (user?.phone != null && user?.phone !== '') {
          navigation.navigate('MyQr');
        } else {
          Toast.show({
            type: 'info',
            text1: 'Vui lòng cập nhật số điện thoại để sử dụng tính năng này.',
            visibilityTime: 1500,
          });
          navigation.navigate('EditProfile');
        }
        break;
      case 3:
        navigation.navigate('Wallet');
        break;
      case 4:
        navigation.navigate('DefaultSchedule');
        break;
      case 5:
        navigation.navigate('Statistics');
        break;
      case 6:
        navigation.navigate('DefaultAddress');
        break;

      default:
        console.warn(`Unhandled menu item ID: ${id}`);
        break;
    }
  };


  

  const handleLogout = async () => {
    try {
      await uninitZegoService();
      // Clear token and sign out from services first
      await signOut();

      dispatch(logout());
    } catch (e) {
      // ignore
    }
  };

  return (
    <MainLayout hideHeader={true}>
      <View className="flex-1 bg-background-50">
        <ScrollView className="flex-1" showsVerticalScrollIndicator={false}>
          {/* Profile Header Card */}
          <View className="px-6 pt-12 pb-6">
            <View
              className="bg-primary-100 rounded-3xl  border-2 border-red-200"
              style={{ padding: (18 * height) / 812 }}
            >
              <View className="flex-row items-center">
                <View className="relative mr-4">
                  <AppAvatar
                    name={user?.name}
                    uri={user?.avatar ?? null}
                    size={85}
                    style={{ borderWidth: 3, borderColor: '#fff' }}
                  />
                </View>

                <View className="flex-1">
                  <View
                  >
                    <Text
                      className="text-xl font-bold text-white mb-1"
                      numberOfLines={1}
                    >
                      {user?.name ?? 'Khách hàng'}
                    </Text>
                  </View>
                  <Text className="text-sm text-white/90" numberOfLines={1}>
                    {user?.email ?? '—'}
                  </Text>

                  {isUser && (
                    <View className="mt-3 bg-white/20 rounded-full px-4 py-2 self-start">
                      <View className="flex-row items-center">
                        <Text className="text-white font-bold text-base mr-2">
                          {isUser &&
                            (loading ? (
                              <ActivityIndicator color="#fff" size="small" />
                            ) : (
                              (balance ?? 0).toLocaleString()
                            ))}
                        </Text>
                        <Text className="text-lg">🪙</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>
          </View>

          {/* Menu Section */}
          <View className="px-6 pb-6">
    
            <View className="bg-white border-2 border-red-200 rounded-2xl shadow-sm overflow-hidden">
              {filteredMenu.map((item, index) => (
                <TouchableOpacity
                  key={item.id}
                  className={`flex-row items-center px-5 py-4 ${
                    index !== filteredMenu.length - 1
                      ? 'border-b border-gray-100'
                      : ''
                  }`}
                  onPress={() => handleMenuPress(item.id)}
                  activeOpacity={0.7}
                >
                  <View
                    className="w-10 h-10 rounded-full items-center justify-center"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <Icon name={item.icon} size={20} color={item.color} />
                  </View>
                  <Text className="ml-4 flex-1 text-base text-gray-800 font-medium">
                    {item.title}
                  </Text>
                  <Icon name="chevron-right" size={20} color="#D1D5DB" />
                </TouchableOpacity>
              ))}
            </View>

            {/* Logout Button */}
            <TouchableOpacity
              onPress={handleLogout}
              className="mt-4 bg-white border-2 border-red-200 rounded-2xl shadow-sm px-5 py-4 flex-row items-center"
              activeOpacity={0.7}
            >
              <View className="w-10 h-10 rounded-full items-center justify-center bg-red-50">
                <Icon name="log-out" size={20} color="#EF4444" />
              </View>
              <Text className="ml-4 flex-1 text-base text-red-500 font-semibold">
                Đăng xuất
              </Text>
              <Icon name="chevron-right" size={20} color="#D1D5DB" />
            </TouchableOpacity>
          </View>

          {/* Bottom Spacing */}
          <View className="h-8" />
        </ScrollView>
      </View>
    </MainLayout>
  );
};

export default ProfileScreen;
