import React from 'react';
import { TouchableOpacity, View } from 'react-native';
import IconFeature from 'react-native-vector-icons/Feather';

interface Props {
  onPress: () => void;
  size?: number;
  color?: string;
  topOffset?: number;
}

export default function CenterPlusButton({
  onPress,
  size = 64,
  color = '#19CCA1',
  topOffset = -20,
}: Props) {
  const radius = size / 2;
  return (
    <TouchableOpacity
      onPress={onPress}
      style={{ top: topOffset, justifyContent: 'center', alignItems: 'center' }}
    >
      <View
        style={{
          width: size,
          height: size,
          borderRadius: radius,
          backgroundColor: color,
          justifyContent: 'center',
          alignItems: 'center',
          elevation: 4,
        }}
      >
        <IconFeature name="plus" color="#fff" size={Math.round(size / 2.25)} />
      </View>
    </TouchableOpacity>
  );
}
