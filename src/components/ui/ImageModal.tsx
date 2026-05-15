import React from 'react';
import { Modal, View, TouchableOpacity, Image, Text } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

type Props = {
  visible: boolean;
  imageUri?: string | null;
  onClose: () => void;
};

const ImageModal: React.FC<Props> = ({ visible, imageUri, onClose }) => {
  return (
    <Modal
      visible={!!visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <View
        style={{
          flex: 1,
          justifyContent: 'center',
          alignItems: 'center',
          backgroundColor: 'rgba(0, 0, 0, 0.5)',
        }}
      >
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 40,
            right: 20,
            zIndex: 1,
            backgroundColor: 'white',
            borderRadius: 15,
            padding: 5,
          }}
        >
          <Text>
            <Icon name="x" size={24} color="black" />
          </Text>
        </TouchableOpacity>
        {imageUri && (
          <Image
            source={{ uri: imageUri }}
            style={{ width: '90%', height: '100%' }}
            resizeMode="contain"
          />
        )}
      </View>
    </Modal>
  );
};

export default ImageModal;
