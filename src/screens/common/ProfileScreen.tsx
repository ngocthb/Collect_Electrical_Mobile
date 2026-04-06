import {
  View,
  Text,
  TouchableOpacity,
  SafeAreaView,
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
import { getUserPoints, dailyPoints } from '../../services/pointsService';
import { uninitZegoService } from '../../config/zego';
import { logout, setUser } from '../../store/slices/authSlice';
import { signOut } from '../../services/authService';
import { useAppDispatch } from '../../store/hooks';
import Toast from 'react-native-toast-message';
import AsyncStorage from '@react-native-async-storage/async-storage';

const DEVELOP_MODE_KEY = 'develop_mode';
const DEVELOP_MODE_TRIGGER_TAPS = 5;
const WEEKDAY_CHECKIN_REWARD = 100;
const SUNDAY_CHECKIN_REWARD = 200;
const WEEK_DAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const menuItems = [
  { id: 1, title: 'Hồ sơ của tôi', icon: 'user', color: '#3366FF' },
  { id: 2, title: 'QR của tôi', icon: 'maximize', color: '#7C3AED' },
  { id: 3, title: 'Kho điểm xanh', icon: 'credit-card', color: '#F59E0B' },
  { id: 4, title: 'Lịch thu gom mặc định', icon: 'calendar', color: '#e85a4f' },
  { id: 5, title: 'Thống kê', icon: 'bar-chart-2', color: '#F97316' },
  { id: 6, title: 'Thông tin địa chỉ', icon: 'map-pin', color: '#059669' },
];

const { width, height } = Dimensions.get('window');
const todayKey = () => new Date().toISOString().slice(0, 10);
const getWeekdayIndexFromMonday = () => (new Date().getDay() + 6) % 7;
const getMondayKey = () => {
  const now = new Date();
  const monday = new Date(now);
  monday.setHours(0, 0, 0, 0);
  monday.setDate(now.getDate() - ((now.getDay() + 6) % 7));
  return monday.toISOString().slice(0, 10);
};
const getCheckInReward = (weekdayIndex: number) =>
  weekdayIndex === 6 ? SUNDAY_CHECKIN_REWARD : WEEKDAY_CHECKIN_REWARD;

const ProfileScreen = () => {
  const { user } = useAppSelector(s => s.auth);
  const [balance, setBalance] = useState<number | null>(null);
  const [loading, setLoading] = useState(false);
  const [isDevelopMode, setIsDevelopMode] = useState(false);
  const [namePressCount, setNamePressCount] = useState(0);
  const [isCheckingIn, setIsCheckingIn] = useState(false);
  const [hasCheckedInToday, setHasCheckedInToday] = useState(false);
  const [checkedWeekDays, setCheckedWeekDays] = useState<number[]>([]);
  const isUser = String(user?.role ?? '').toLowerCase() === 'user';
  const dispatch = useAppDispatch();
  console.log(user);

  const checkInKey = `daily_checkin_${user?.userId ?? 'guest'}`;
  const weekCheckInKey = `daily_checkin_week_${
    user?.userId ?? 'guest'
  }_${getMondayKey()}`;

  useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const savedMode = await AsyncStorage.getItem(DEVELOP_MODE_KEY);
        if (mounted) {
          setIsDevelopMode(savedMode === 'true');
        }
      } catch (error) {
        console.warn('[Profile] Failed to load develop mode', error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, []);

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

  useEffect(() => {
    let mounted = true;

    (async () => {
      if (!isUser || !user?.userId) {
        if (mounted) {
          setHasCheckedInToday(false);
          setCheckedWeekDays([]);
        }
        return;
      }

      try {
        const [savedDate, savedWeekDays] = await Promise.all([
          AsyncStorage.getItem(checkInKey),
          AsyncStorage.getItem(weekCheckInKey),
        ]);
        const todayIndex = getWeekdayIndexFromMonday();
        const parsedWeekDays: number[] = savedWeekDays
          ? JSON.parse(savedWeekDays)
          : [];
        const checkedToday =
          savedDate === todayKey() || parsedWeekDays.includes(todayIndex);

        if (mounted) {
          setHasCheckedInToday(checkedToday);
          setCheckedWeekDays(parsedWeekDays);
        }
      } catch (error) {
        console.warn('[Profile] Failed to load daily check-in state', error);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [checkInKey, isUser, user?.userId, weekCheckInKey]);

  const filteredMenu = menuItems.filter(item => {
    if (isUser) {
      return [1, 2, 3, 6].includes(item.id);
    }

    return [1, 5].includes(item.id);
  });
  const todayWeekIndex = getWeekdayIndexFromMonday();

  const navigation = useNavigation<any>();

  const handleNamePress = async () => {
    try {
      const nextCount = namePressCount + 1;
      setNamePressCount(nextCount);

      if (nextCount >= DEVELOP_MODE_TRIGGER_TAPS) {
        const nextMode = !isDevelopMode;
        setIsDevelopMode(nextMode);
        setNamePressCount(0);
        await AsyncStorage.setItem(
          DEVELOP_MODE_KEY,
          nextMode ? 'true' : 'false',
        );
        Toast.show({
          type: 'info',
          text1: nextMode ? 'Đã bật Develop mode' : 'Đã tắt Develop mode',
          visibilityTime: 1500,
        });
      }
    } catch (error) {
      console.warn('[Profile] Failed to toggle develop mode', error);
    }
  };

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

  const handleDailyCheckIn = async () => {
    if (!isUser || !user?.userId || isCheckingIn || hasCheckedInToday) return;

    try {
      setIsCheckingIn(true);
      const todayIndex = getWeekdayIndexFromMonday();
      const reward = getCheckInReward(todayIndex);
      const updatedWeekDays = checkedWeekDays.includes(todayIndex)
        ? checkedWeekDays
        : [...checkedWeekDays, todayIndex].sort((a, b) => a - b);

      // Call API to add points
      await dailyPoints(user.userId, reward);

      // Update local storage
      await Promise.all([
        AsyncStorage.setItem(checkInKey, todayKey()),
        AsyncStorage.setItem(weekCheckInKey, JSON.stringify(updatedWeekDays)),
      ]);

      // Update user points in store
      const updatedUser = {
        ...user,
        points: (user.points ?? 0) + reward,
      };
      dispatch(setUser(updatedUser));

      // Update local state
      setHasCheckedInToday(true);
      setCheckedWeekDays(updatedWeekDays);
      setBalance(prev => (prev ?? 0) + reward);
      Toast.show({
        type: 'success',
        text1: `Bạn đã nhận được ${reward} 🪙`,
        visibilityTime: 1500,
      });
    } catch (error) {
      console.warn('[Profile] Failed to check in', error);
      Toast.show({
        type: 'error',
        text1: 'Không thể điểm danh, vui lòng thử lại',
        visibilityTime: 1500,
      });
    } finally {
      setIsCheckingIn(false);
    }
  };

  const handleWeekDayPress = (index: number) => {
    if (index !== todayWeekIndex) return;
    handleDailyCheckIn();
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
                  <TouchableOpacity
                    onPress={handleNamePress}
                    activeOpacity={0.8}
                  >
                    <Text
                      className="text-xl font-bold text-white mb-1"
                      numberOfLines={1}
                    >
                      {user?.name ?? 'Khách hàng'}
                    </Text>
                  </TouchableOpacity>
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
            {isDevelopMode && isUser && (
              <View className="mb-4 bg-white  border-2 border-red-200 rounded-2xl px-4 py-4">
                <View className="flex-row items-start">
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900 text-center">
                      Điểm danh hằng ngày
                    </Text>
                  </View>
                </View>

                <View className="mt-4 flex-row justify-between">
                  {WEEK_DAYS.map((day, index) => {
                    const isChecked = checkedWeekDays.includes(index);
                    const isToday = index === todayWeekIndex;
                    const isPressable = isToday && !isChecked && !isCheckingIn;

                    return (
                      <TouchableOpacity
                        key={day}
                        onPress={() => handleWeekDayPress(index)}
                        disabled={!isPressable}
                        activeOpacity={0.8}
                        className={`w-10 h-12 rounded-xl border items-center justify-center ${
                          isChecked
                            ? 'bg-red-400 border-red-500'
                            : 'bg-white border-gray-200'
                        }`}
                      >
                        <Text
                          className={`text-[10px] font-semibold ${
                            isChecked ? 'text-white' : 'text-primary-100'
                          }`}
                        >
                          {day}
                        </Text>
                        <Text
                          className={`text-xs mt-1 font-bold ${
                            isChecked
                              ? 'text-white'
                              : isToday
                              ? 'text-amber-600'
                              : 'text-gray-400'
                          }`}
                        >
                          {getCheckInReward(index)}
                        </Text>
                      </TouchableOpacity>
                    );
                  })}
                </View>
              </View>
            )}

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
