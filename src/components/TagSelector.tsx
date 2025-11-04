import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';

interface TagSelectorProps {
  tags: string[];
  selectedTags: string[];
  onToggleTag: (tag: string) => void;
}

const TagSelector: React.FC<TagSelectorProps> = ({
  tags,
  selectedTags,
  onToggleTag,
}) => {
  return (
    <View className="mb-4">
      <Text className="text-sm font-semibold mb-3 text-gray-900">
        Nhập mô tả sản phẩm<Text className="text-red-500"> *</Text>
      </Text>
      <View className="flex-row flex-wrap">
        {tags.map(tag => (
          <TouchableOpacity
            key={tag}
            className={`px-4 py-2.5 rounded-full mr-2 mb-2 border-2 ${
              selectedTags.includes(tag)
                ? 'bg-blue-500 border-blue-500'
                : 'bg-white border-gray-200'
            }`}
            onPress={() => onToggleTag(tag)}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedTags.includes(tag) ? 'text-white' : 'text-gray-600'
              }`}
            >
              {tag}
            </Text>
          </TouchableOpacity>
        ))}
      </View>
    </View>
  );
};

export default TagSelector;
