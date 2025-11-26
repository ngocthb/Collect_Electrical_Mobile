import React from 'react';
import { View, Image, TouchableOpacity, Text, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import type { Asset } from 'react-native-image-picker';

interface AppImageGalleryProps {
  images: Asset[];
  onRemove: (index: number) => void;
  onAddPress: () => void;
}

const AppImageGallery = ({
  images,
  onRemove,
  onAddPress,
}: AppImageGalleryProps) => {
  const isVideo = (item: Asset) => item.type?.startsWith('video/');

  return (
    <View className="mb-2">
      <Text className="text-sm font-semibold mb-2 text-primary-100">
        Hình ảnh / Video về sản phẩm
        <Text className="text-red-500"> *</Text>
      </Text>
      <Text className="text-gray-500 text-xs mb-3">
        Tối đa 5 ảnh/video, mỗi file không quá 10MB
      </Text>
      <ScrollView
        horizontal
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={{ paddingVertical: 2 }}
      >
        {images.map((item, index) => (
          <View key={index} className="mr-3 mb-3 relative">
            <Image
              source={{ uri: item.uri }}
              className="w-24 h-24 rounded-xl"
              resizeMode="cover"
            />

            {isVideo(item) && (
              <View className="absolute inset-0 items-center justify-center bg-black/30 rounded-xl">
                <View className="w-10 h-10 rounded-full bg-white/90 items-center justify-center">
                  <Icon
                    name="play"
                    size={20}
                    color="#e85a4f"
                    style={{ marginLeft: 2 }}
                  />
                </View>
              </View>
            )}

            <TouchableOpacity
              onPress={() => onRemove(index)}
              className="absolute top-0 -right-2 bg-red-500 rounded-full w-7 h-7 items-center justify-center"
              style={{
                shadowColor: '#EF4444',
                shadowOffset: { width: 0, height: 2 },
                shadowOpacity: 0.4,
                shadowRadius: 4,
              }}
            >
              <Icon name="close" size={16} color="#FFF" />
            </TouchableOpacity>
          </View>
        ))}

        {images.length < 5 && (
          <TouchableOpacity
            className="w-24 h-24 border-2 border-dashed border-red-200 rounded-xl items-center justify-center bg-gray-50 mr-3 mb-3"
            onPress={onAddPress}
          >
            <Icon name="camera" size={32} color="#E98074" />
            <Text className="text-gray-400 text-xs mt-1">Thêm</Text>
          </TouchableOpacity>
        )}
      </ScrollView>
    </View>
  );
};

export default AppImageGallery;
