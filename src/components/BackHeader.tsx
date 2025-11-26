import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface BackHeaderProps {
  title: string;
  onBackPress: () => void;
  // optional right slot for placing a small control (calendar, filter, etc.)
  rightComponent?: React.ReactNode;
}

const BackHeader: React.FC<BackHeaderProps> = ({
  title,
  onBackPress,
  rightComponent,
}) => {
  return (
    <View className="flex-row items-center justify-between px-4 py-6 bg-background-50">
      <View className="flex-row items-center">
        <TouchableOpacity onPress={onBackPress} className="mr-4">
          <Icon name="chevron-left" size={24} color="#333" />
        </TouchableOpacity>
        <Text className="text-lg font-bold text-text-main">{title}</Text>
      </View>

      {rightComponent ? <View>{rightComponent}</View> : null}
    </View>
  );
};

export default BackHeader;
