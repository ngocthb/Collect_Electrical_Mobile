import React from 'react';
import AppImageGallery from './ui/AppImageGallery';
import ImagePickerModal from './ImagePickerModal';
import type { Asset } from 'react-native-image-picker';

interface ImageGalleryProps {
  selectedImages: Asset[];
  onRemoveImage: (index: number) => void;
  onAddImage: (assets: Asset[]) => void;
  showImagePicker: boolean;
  onClosePicker: () => void;
}

const ImageGallery: React.FC<ImageGalleryProps> = ({
  selectedImages,
  onRemoveImage,
  onAddImage,
  showImagePicker,
  onClosePicker,
}) => {
  const [showPicker, setShowPicker] = React.useState(false);

  const openPicker = () => setShowPicker(true);
  const closePicker = () => setShowPicker(false);

  React.useEffect(() => {
    setShowPicker(showImagePicker);
  }, [showImagePicker]);

  const handleAddImage = (assets: Asset[]) => {
    onAddImage(assets);
    closePicker();
  };

  return (
    <>
      <AppImageGallery
        images={selectedImages}
        onRemove={onRemoveImage}
        onAddPress={openPicker} // Fixed to open the picker modal
      />
      <ImagePickerModal
        visible={showPicker}
        onClose={closePicker}
        onSelect={handleAddImage}
        currentCount={selectedImages.length}
        maxItems={5}
      />
    </>
  );
};

export default ImageGallery;
