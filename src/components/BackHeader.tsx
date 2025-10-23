import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface BackHeaderProps {
  title: string;
  onBackPress: () => void;
}

const BackHeader: React.FC<BackHeaderProps> = ({ title, onBackPress }) => {
  return (
    <View className="flex-row items-center px-4 py-6 bg-white">
      <TouchableOpacity onPress={onBackPress} className="mr-4">
        <Icon name="chevron-left" size={24} color="#333" />
      </TouchableOpacity>
      <Text className="text-lg font-bold text-text-main">{title}</Text>
    </View>
  );
};

export default BackHeader;
