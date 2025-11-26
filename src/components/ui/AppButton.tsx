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
  icon?: React.ReactNode;
}

const AppButton: React.FC<AppButtonProps> = ({
  title,
  onPress,
  loading = false,
  disabled = false,
  color = '#e85a4f',
  textColor = '#FFFFFF',
  spinnerColor = '#FFFFFF',
  className = '',
  textClassName = '',
  size = 'large',
  icon,
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
      className={`w-full flex-col items-center justify-center rounded-xl border-2 border-red-200 ${heightClass} ${className}`}
    >
      {loading ? (
        <View className="flex-row items-center space-x-2">
          <ActivityIndicator size="small" color={spinnerColor} />
        </View>
      ) : (
        <View className="flex-row items-center justify-center">
          {icon ? <View className="mr-2">{icon}</View> : null}
          <Text
            style={{ color: textColor }}
            className={`font-semibold text-center ${fontClass} ${textClassName}`}
          >
            {title}
          </Text>
        </View>
      )}
    </TouchableOpacity>
  );
};

export default AppButton;
