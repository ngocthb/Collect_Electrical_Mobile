import React from 'react';
import { View, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HeaderProps {
  onMenuPress?: () => void;
  onNotificationPress?: () => void;
}

const Header: React.FC<HeaderProps> = ({
  onMenuPress,
  onNotificationPress,
}) => {
  return (
    <View className="flex-row items-center justify-between px-6 py-8 mb-6">
      <TouchableOpacity onPress={onMenuPress}>
        <Icon name="menu" size={28} color="#333" />
      </TouchableOpacity>

      <TouchableOpacity onPress={onNotificationPress}>
        <Icon name="notifications-none" size={28} color="#333" />
      </TouchableOpacity>
    </View>
  );
};

export default Header;
