import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface Option {
  id: string | number;
  label: string;
  value?: any;
}

interface AppDropdownProps {
  options: Option[];
  placeholder?: string;
  onSelect: (option: Option) => void;
  title?: string;
  required?: boolean; // Added required prop
}

const AppDropdown: React.FC<AppDropdownProps> = ({
  options,
  placeholder,
  onSelect,
  title,
  required,
}) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<string | null>(
    options.length > 0 ? options[0].label : null, // Default to the first option
  );

  useEffect(() => {
    if (options.length > 0) {
      onSelect(options[0]); // Automatically select the first option
    }
  }, [options, onSelect]);

  const handleSelect = (option: Option) => {
    setSelectedOption(option.label);
    onSelect(option);
    setDropdownVisible(false);
  };

  return (
    <View className="relative">
      {title && (
        <Text className="text-sm font-medium mb-2 text-text-main">
          {title} {required && <Text className="text-red-500">*</Text>}
        </Text>
      )}

      <TouchableOpacity
        className="border border-gray-300 rounded-md p-3 flex-row justify-between items-center"
        onPress={() => setDropdownVisible(!isDropdownVisible)}
      >
        <Text className="text-sm text-text-main">
          {selectedOption || placeholder || 'Select an option'}
        </Text>
        <Icon name="chevron-down" size={20} color="gray" />
      </TouchableOpacity>

      {isDropdownVisible && (
        <View className="absolute top-full left-0 right-0 bg-white border border-gray-300 rounded-md mt-0 z-10">
          <FlatList
            data={options}
            keyExtractor={item => String(item.id)}
            renderItem={({ item }) => (
              <TouchableOpacity
                className="p-3 border-b border-gray-200"
                onPress={() => handleSelect(item)}
              >
                <Text className="text-sm text-text-main">{item.label}</Text>
              </TouchableOpacity>
            )}
          />
        </View>
      )}
    </View>
  );
};

export default AppDropdown;
