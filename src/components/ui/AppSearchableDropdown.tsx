import React, { useState, useRef, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  ScrollView,
  Pressable,
  ActivityIndicator,
} from 'react-native';

interface AppSearchableDropdownProps<T> {
  title: string;
  placeholder: string;
  value: T | null;
  options: T[];
  onSelect: (item: T | null) => void;
  onSearch: (query: string) => void;
  displayKey: string;
  required?: boolean;
  loading?: boolean;
}

const AppSearchableDropdown = <T extends Record<string, any>>({
  title,
  placeholder,
  value,
  options,
  onSelect,
  onSearch,
  displayKey,
  required = false,
  loading = false,
}: AppSearchableDropdownProps<T>) => {
  const [isOpen, setIsOpen] = useState(false);
  const [searchQuery, setSearchQuery] = useState('');
  const debounceTimer = useRef<ReturnType<typeof setTimeout> | null>(null);
  const inputRef = useRef<TextInput>(null);
  const lastSearchedQuery = useRef(''); // ✅ Track query đã search

  const displayValue = value && !isOpen ? value[displayKey] : searchQuery;

  useEffect(() => {
    // ✅ Chỉ search khi có query và khác với lần search trước
    if (searchQuery.length === 0 || searchQuery === lastSearchedQuery.current) {
      return;
    }

    // Clear timeout cũ
    if (debounceTimer.current) {
      clearTimeout(debounceTimer.current);
    }

    // Set timeout mới - chỉ chạy sau 500ms user ngừng nhập
    debounceTimer.current = setTimeout(() => {
      console.log('🔍 Searching for:', searchQuery);
      lastSearchedQuery.current = searchQuery; // ✅ Lưu query đã search
      onSearch(searchQuery);
    }, 500);

    // Cleanup
    return () => {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
    };
  }, [searchQuery]); // ✅ Chỉ depend vào searchQuery

  const handleInputChange = (text: string) => {
    setSearchQuery(text);
    if (!isOpen) setIsOpen(true);
  };

  const handleSelect = (item: T) => {
    console.log('Item selected:', item);
    setSearchQuery('');
    lastSearchedQuery.current = ''; // ✅ Reset khi select
    setIsOpen(false);
    onSelect(item);
  };

  const handleInputFocus = () => {
    setIsOpen(true);
  };

  const handleKeyPress = ({ nativeEvent }: any) => {
    if (nativeEvent.key === 'Enter') {
      if (debounceTimer.current) {
        clearTimeout(debounceTimer.current);
      }
      lastSearchedQuery.current = searchQuery;
      onSearch(searchQuery);
    }
  };

  return (
    <View className="mb-4 relative">
      <Text className="text-sm font-semibold mb-3 text-gray-900">
        {title}
        {required && <Text className="text-red-500"> *</Text>}
      </Text>

      <View className="relative">
        <TextInput
          ref={inputRef}
          className="border border-gray-300 rounded-lg px-4 py-3 pr-12 text-gray-900 bg-white"
          placeholder={placeholder}
          placeholderTextColor="#9CA3AF"
          value={displayValue === '' ? undefined : (displayValue as string)}
          onChangeText={handleInputChange}
          onFocus={handleInputFocus}
          onKeyPress={handleKeyPress}
        />
      </View>

      {isOpen &&
        (loading ||
          options.length > 0 ||
          searchQuery.length > 0 ||
          (searchQuery.length === 0 && options.length === 0)) && (
          <View className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-lg mt-1 max-h-60 z-50 shadow-lg">
            {loading ? (
              <View className="p-4 items-center">
                <ActivityIndicator size="small" color="#4169E1" />
                <Text className="text-gray-500 mt-2">Đang tìm kiếm...</Text>
              </View>
            ) : (
              <ScrollView style={{ maxHeight: 240 }} nestedScrollEnabled>
                {options.length > 0 ? (
                  options.map((item, index) => (
                    <Pressable
                      key={`${item.id || index}`}
                      className="px-4 py-3 border-b border-gray-100"
                      onPress={() => handleSelect(item)}
                      style={({ pressed }) => [
                        {
                          backgroundColor: pressed ? '#f3f4f6' : 'transparent',
                        },
                      ]}
                    >
                      <Text className="text-gray-900">{item[displayKey]}</Text>
                    </Pressable>
                  ))
                ) : (
                  <View className="p-4 items-center">
                    <Text className="text-gray-500">
                      Không tìm thấy kết quả
                    </Text>
                  </View>
                )}
              </ScrollView>
            )}
          </View>
        )}
    </View>
  );
};

export default AppSearchableDropdown;
