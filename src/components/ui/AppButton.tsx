import React from 'react';
import {
  TouchableOpacity,
  Text,
  ActivityIndicator,
  View,
  GestureResponderEvent,
} from 'react-native';

interface AppButtonProps {
  title: string;
  onPress?: (event: GestureResponderEvent) => void;
  loading?: boolean;
  disabled?: boolean;
  color?: string; // màu nền
  textColor?: string;
  className?: string;
  textClassName?: string;
  spinnerColor?: string;
  size?: 'small' | 'large';
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  color = '#2563EB',
  textColor = '#FFFFFF',
  spinnerColor = '#FFFFFF',
  className = '',
  textClassName = '',
  size = 'large',
}) => {
  const isDisabled = disabled || loading;
  const heightClass = size === 'small' ? 'py-2' : 'py-4';
  const fontClass = size === 'small' ? 'text-sm' : 'text-base';

  return (
    <TouchableOpacity
      onPress={onPress}
      activeOpacity={0.8}
      disabled={isDisabled}
      style={{
        backgroundColor: color,
        opacity: isDisabled ? 0.6 : 1,
      }}
      className={`w-full flex-row items-center justify-center rounded-xl ${heightClass} ${className}`}
    >
      {loading ? (
        <View className="flex-row items-center space-x-2">
          <ActivityIndicator size="small" color={spinnerColor} />
        </View>
      ) : (
        <Text
          style={{ color: textColor }}
          className={`font-semibold ${fontClass} ${textClassName}`}
        >
          {title}
        </Text>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;
