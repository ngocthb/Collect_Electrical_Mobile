import React from 'react';
import { View, TouchableOpacity, Text } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialIcons';

interface HeaderProps {
  icon?: string;
  title?: string;
  subtitle?: string;
  rightComponent?: React.ReactNode;
}

const Header: React.FC<HeaderProps> = ({
  icon,
  title,
  subtitle,
  rightComponent,
}) => {
  return (
    <View className="flex-row bg-background-50 items-center justify-between px-6 py-8">
      {icon && <Icon name={icon} size={28} color="#333" className="mr-2" />}

      <View className="flex-1 ">
        {title && (
          <Text className="text-lg font-semibold text-gray-900">{title}</Text>
        )}
        {subtitle && <Text className="text-sm text-gray-600">{subtitle}</Text>}
      </View>
      {rightComponent && <View>{rightComponent}</View>}
    </View>
  );
};

export default Header;
