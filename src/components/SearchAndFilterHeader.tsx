import React from 'react';
import { View } from 'react-native';
import AppInput from './ui/AppInput';

interface SearchInputHeaderProps {
  searchQuery: string;
  onSearchChange: (query: string) => void;
  placeholder?: string;
}

export default function SearchInputHeader({
  searchQuery,
  onSearchChange,
  placeholder = 'Tìm kiếm...',
}: SearchInputHeaderProps) {
  return (
    <View className="px-6 ">
      <AppInput
        placeholder={placeholder}
        value={searchQuery}
        onChangeText={onSearchChange}
      />
    </View>
  );
}
