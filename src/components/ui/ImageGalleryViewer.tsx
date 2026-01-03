import React, { useState } from 'react';
import {
  View,
  ScrollView,
  TouchableOpacity,
  Image,
  StyleSheet,
  Dimensions,
} from 'react-native';
import ImageModal from './ImageModal';

interface ImageGalleryViewerProps {
  images: string[];
  imageSize?: number;
  imageSpacing?: number;
  borderRadius?: number;
}
const { width, height } = Dimensions.get('window');
const ImageGalleryViewer: React.FC<ImageGalleryViewerProps> = ({
  images,
  imageSize = 84,
  imageSpacing = 12,
  borderRadius = 12,
}) => {
  const [isModalVisible, setModalVisible] = useState(false);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);

  const handleImagePress = (imageUri: string) => {
    setSelectedImage(imageUri);
    setModalVisible(true);
  };

  const handleCloseModal = () => {
    setModalVisible(false);
    setSelectedImage(null);
  };

  if (!images || images.length === 0) return null;

  const shouldCenter = images.length <= 2;
  const scrollEnabled = images.length > 1;

  return (
    <View>
      <ScrollView
        horizontal
        scrollEnabled={scrollEnabled}
        showsHorizontalScrollIndicator={false}
        contentContainerStyle={[
          styles.scrollContainer,
          shouldCenter && styles.centerContainer,
        ]}
      >
        {images.map((img: string, i: number) => (
          <TouchableOpacity key={i} onPress={() => handleImagePress(img)}>
            <Image
              source={{ uri: img }}
              style={{
                width: (imageSize * height) / 812,
                height: imageSize * (height / 812),
                borderRadius: borderRadius,
                marginRight: i < images.length - 1 ? imageSpacing : 0,
              }}
              resizeMode="cover"
            />
          </TouchableOpacity>
        ))}
      </ScrollView>

      <ImageModal
        visible={isModalVisible}
        imageUri={selectedImage}
        onClose={handleCloseModal}
      />
    </View>
  );
};

const styles = StyleSheet.create({
  scrollContainer: {
    paddingVertical: 4,
  },
  centerContainer: {
    flexGrow: 1,
    justifyContent: 'center',
  },
});

export default ImageGalleryViewer;
