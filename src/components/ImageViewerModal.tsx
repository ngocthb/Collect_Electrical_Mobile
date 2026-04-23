import React, { useState } from 'react';
import {
  View,
  Modal,
  Image,
  TouchableOpacity,
  FlatList,
  Dimensions,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface ImageViewerModalProps {
  images: string[];
  initialIndex?: number;
  visible: boolean;
  onClose: () => void;
}

const { width, height } = Dimensions.get('window');

const ImageViewerModal: React.FC<ImageViewerModalProps> = ({
  images,
  initialIndex = 0,
  visible,
  onClose,
}) => {
  const [currentIndex, setCurrentIndex] = useState(initialIndex);

  const handleScroll = (event: any) => {
    const slide = Math.ceil(
      event.nativeEvent.contentOffset.x /
        event.nativeEvent.layoutMeasurement.width,
    );
    if (slide !== currentIndex) {
      setCurrentIndex(slide);
    }
  };

  const renderImage = ({ item }: { item: string }) => (
    <View style={{ width, height: height * 0.75, justifyContent: 'center' }}>
      <Image
        source={{ uri: item }}
        style={{ width: '100%', height: '100%' }}
        resizeMode="contain"
      />
    </View>
  );

  return (
    <Modal visible={visible} transparent={true} animationType="fade">
      <View className="flex-1 bg-black/30">
        {/* Header */}
        <View className="bg-black/20 px-5 py-4 flex-row items-center justify-between">
          <TouchableOpacity onPress={onClose}>
            <Icon name="x" size={28} color="white" />
          </TouchableOpacity>
          <Text className="text-white font-semibold">
            {currentIndex + 1} / {images.length}
          </Text>
          <View style={{ width: 28 }} />
        </View>

        {/* Image Gallery */}
        <View className="flex-1 justify-center">
          <FlatList
            data={images}
            renderItem={renderImage}
            keyExtractor={(_, index) => `image-${index}`}
            horizontal={true}
            pagingEnabled={true}
            scrollEventThrottle={32}
            onScroll={handleScroll}
            scrollEnabled={true}
            showsHorizontalScrollIndicator={false}
            initialScrollIndex={initialIndex}
            getItemLayout={(data, index) => ({
              length: width,
              offset: width * index,
              index,
            })}
          />
        </View>

        {/* Image Indicators */}
        <View className="bg-black/20 py-5 flex-row justify-center">
          <View className="flex-row items-center gap-1.5">
            {images.map((_, index) => (
              <View
                key={index}
                className={`rounded-full ${
                  index === currentIndex
                    ? 'bg-white w-2 h-2'
                    : 'bg-white/40 w-1.5 h-1.5'
                }`}
              />
            ))}
          </View>
        </View>
      </View>
    </Modal>
  );
};

export default ImageViewerModal;
