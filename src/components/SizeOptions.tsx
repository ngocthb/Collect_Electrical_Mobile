import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface SizeOptionsProps {
  title: string;
  options: string[];
  selectedOptions: string[];
  onToggle: (option: string) => void;
  emptyText?: string;
}

const SizeOptions: React.FC<SizeOptionsProps> = ({
  title,
  options,
  selectedOptions,
  onToggle,
  emptyText = 'Không có dữ liệu',
}) => {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold mb-3 text-primary-100">
        {title}
        <Text className="text-red-500"> *</Text>
      </Text>
      <View className="flex-row flex-wrap">
        {options.length > 0 ? (
          options.map(option => (
            <TouchableOpacity
              key={option}
              className={`px-4 py-2.5 rounded-full mr-2 mb-2 border-2 ${
                selectedOptions.includes(option) ? 'bg-primary-100' : 'bg-white'
              }`}
              style={{ borderColor: '#F2B7AC' }}
              onPress={() => onToggle(option)}
            >
              <Text
                className={`text-sm font-semibold ${
                  selectedOptions.includes(option)
                    ? 'text-white'
                    : 'text-primary-100'
                }`}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))
        ) : (
          <View className="flex-1 items-center">
            <Icon name="inbox" size={40} color="#6B7280" />
            <Text className="text-gray-500 text-sm">{emptyText}</Text>
          </View>
        )}
      </View>
    </View>
  );
};

export default SizeOptions;
