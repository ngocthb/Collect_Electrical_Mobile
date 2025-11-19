import React, { useEffect, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  Image,
  Modal,
  SafeAreaView,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconMaterial from 'react-native-vector-icons/MaterialIcons';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import { getUserPoints } from '../services/pointsService';
import { logout } from '../store/authSlice';
import AppAvatar from './ui/AppAvatar';
import Animated, {
  useSharedValue,
  useAnimatedStyle,
  withTiming,
} from 'react-native-reanimated';
import { uninitZegoService } from '../config/zego';
interface SidebarProps {
  visible: boolean;
  onClose: () => void;
}

const Sidebar = ({ visible, onClose }: SidebarProps) => {
  const dispatch = useAppDispatch();
  const { user, role } = useAppSelector(s => s.auth);
  const [points, setPoints] = React.useState<number | null>(null);

  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const userId = user?.userId;
        if (!userId) return;
        const res = await getUserPoints(userId);
        if (mounted && res && typeof res.points === 'number')
          setPoints(res.points);
      } catch (e) {
        // ignore
      }
    })();
    return () => {
      mounted = false;
    };
  }, [user]);
  const slideAnim = useSharedValue(-300);

  useEffect(() => {
    slideAnim.value = visible
      ? withTiming(0, { duration: 300 })
      : withTiming(-300, { duration: 300 });
  }, [visible]);

  const animatedStyle = useAnimatedStyle(() => ({
    transform: [{ translateX: slideAnim.value }],
  }));

  const handleLogout = async () => {
    await uninitZegoService();
    dispatch(logout());
    onClose();
  };

  const menuItems = [
    { id: 1, title: 'Về chúng tôi', icon: 'alert-octagon' },
    { id: 2, title: 'Đánh giá', icon: 'star' },
    { id: 3, title: 'Báo cáo', icon: 'alert-triangle' },
    { id: 4, title: 'Cài đặt', icon: 'settings' },
  ];

  return (
    <Modal
      visible={visible}
      transparent
      animationType="none"
      onRequestClose={onClose}
    >
      <View className="flex-1">
        {/* Overlay */}
        <TouchableOpacity
          className="flex-1 bg-black/50"
          onPress={onClose}
          activeOpacity={1}
        />

        {/* Sidebar */}
        <Animated.View
          style={animatedStyle}
          className="absolute top-0 left-0 bottom-0 w-3/5 bg-white shadow-lg"
        >
          <SafeAreaView className="flex-1">
            {/* Header */}
            <View className="px-6 py-8 border-b border-gray-200 bg-gray-50">
              <View className="flex-row items-center">
                <View className="relative bg-secondary-100 rounded-full p-1">
                  <AppAvatar
                    name={user?.name}
                    uri={user?.avatar ?? null}
                    size={64}
                    style={{ borderWidth: 4, borderColor: '#fff' }}
                  />
                </View>
                <View className="ml-3 w-3/5 h-[64px] justify-center">
                  <Text
                    className="text-base font-bold text-text-main text-left"
                    numberOfLines={2}
                  >
                    {user?.name}
                  </Text>

                  {role !== 'delivery' && (
                    <View className="flex-row items-center justify-start mt-1">
                      <Text className="text-base font-bold text-primary-100 mr-2">
                        {points != null ? points : 0}
                      </Text>
                      <View className="w-6 h-6 bg-yellow-400 rounded-full items-center justify-center">
                        <Text className="text-xs">🪙</Text>
                      </View>
                    </View>
                  )}
                </View>
              </View>
            </View>

            {/* Menu Items */}
            <ScrollView className="flex-1 px-6 py-6">
              {menuItems.map(item => (
                <TouchableOpacity
                  key={item.id}
                  className="flex-row items-center py-6"
                  onPress={() => console.log('Menu item pressed:', item.title)}
                >
                  <Icon name={item.icon} size={24} className="text-gray-600" />
                  <Text className="ml-4 font-medium text-lg text-text-sub">
                    {item.title}
                  </Text>
                </TouchableOpacity>
              ))}
            </ScrollView>

            {/* Logout Button */}
            <View className="px-6 py-4 border-t border-gray-200">
              <TouchableOpacity
                className="flex-row items-center py-4"
                onPress={handleLogout}
              >
                <IconMaterial name="logout" size={24} color="red" />

                <Text className="ml-4 text-lg text-red-500 font-medium">
                  Đăng xuất
                </Text>
              </TouchableOpacity>
            </View>
          </SafeAreaView>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default Sidebar;
