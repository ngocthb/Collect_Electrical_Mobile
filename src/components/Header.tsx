import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HeaderProps {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
  title?: string;
  subtitle?: string;
}

const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onNotificationPress,
  title,
  subtitle,
}) => {
  return (
    <View className="flex-row bg-white items-center justify-between px-6 py-8">
      <TouchableOpacity onPress={onMenuPress}>
        <Icon name="menu" size={28} color="#333" />
      </TouchableOpacity>

      <View className="flex-1 ml-6 ">
        {title && (
          <Text className="text-lg font-semibold text-gray-900">{title}</Text>
        )}
        {subtitle && <Text className="text-sm text-gray-600">{subtitle}</Text>}
      </View>
      <TouchableOpacity onPress={onNotificationPress}>
        <Icon name="notifications-none" size={28} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
