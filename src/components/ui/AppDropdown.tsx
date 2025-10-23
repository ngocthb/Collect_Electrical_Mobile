import React, { useState, useEffect } from 'react';
import {
  View,
  Text,
  TextInput,
  TouchableOpacity,
  ScrollView,
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
  required?: boolean;
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
    options.length > 0 ? options[0].label : null,
  );

  useEffect(() => {
    if (options.length > 0) {
      onSelect(options[0]);
    }
  }, [options, onSelect]);

  const handleSelect = (option: Option) => {
    setSelectedOption(option.label);
    onSelect(option);
    setDropdownVisible(false);
  };

  return (
    <View className="relative mb-4">
      {title && (
        <Text className="text-sm font-medium mb-2 text-text-main">
          {title} {required && <Text className="text-red-500">*</Text>}
        </Text>
      )}

      <TouchableOpacity
        className="border border-gray-300 rounded-xl p-4 flex-row justify-between items-center bg-white"
        onPress={() => setDropdownVisible(!isDropdownVisible)}
      >
        <Text
          className={`text-sm ${
            selectedOption ? 'text-gray-900' : 'text-gray-400'
          }`}
        >
          {selectedOption || placeholder || 'Chọn một tùy chọn'}
        </Text>
        <Icon
          name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
          size={20}
          color="#6B7280"
        />
      </TouchableOpacity>

      {isDropdownVisible && (
        <View
          className="absolute top-full left-0 right-0 bg-white border border-gray-200 rounded-xl mt-2 z-50 shadow-lg"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <ScrollView
            className="max-h-60"
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {options.map((item, index) => (
              <TouchableOpacity
                key={String(item.id)}
                className={`p-4 ${
                  index !== options.length - 1 ? 'border-b border-gray-100' : ''
                } ${selectedOption === item.label ? 'bg-blue-50' : 'bg-white'}`}
                onPress={() => handleSelect(item)}
              >
                <View className="flex-row items-center justify-between">
                  <Text
                    className={`text-sm ${
                      selectedOption === item.label
                        ? 'text-primary-100 font-semibold'
                        : 'text-gray-700'
                    }`}
                  >
                    {item.label}
                  </Text>
                  {selectedOption === item.label && (
                    <Icon name="check" size={18} color="#4169E1" />
                  )}
                </View>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default AppDropdown;
