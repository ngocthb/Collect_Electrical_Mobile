import React, { useState, forwardRef } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TextInputProps } from 'react-native';

interface AppInputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  // Nếu true sẽ dùng bàn phím số (phone-pad) và một số xử lý mặc định cho số điện thoại
  isPhone?: boolean;
  isNumeric?: boolean; // New prop to enable numeric input
  numberOfLines?: number; // New prop to specify the number of lines
}

const AppInput = forwardRef<TextInput, AppInputProps>(
  (
    {
      label,
      value,
      onChangeText,
      placeholder,
      secureTextEntry = false,
      error,
      required = false,
      disabled = false,
      isPhone = false,
      isNumeric = false,
      numberOfLines = 1, // Default value is 1
      ...props
    },
    ref,
  ) => {
    const [showPassword, setShowPassword] = useState(false);
    const [isFocused, setIsFocused] = useState(false);

    const isPassword = secureTextEntry;
    const displaySecure = isPassword && !showPassword;

    const handleFocus = (e: any) => {
      setIsFocused(true);
      props.onFocus?.(e);
    };

    const handleBlur = (e: any) => {
      setIsFocused(false);
      props.onBlur?.(e);
    };

    const togglePassword = () => {
      setShowPassword(!showPassword);
    };

    return (
      <View className="mb-4">
        {/* Label */}
        {label && (
          <Text
            className={`text-sm font-medium mb-2 ${
              error ? 'text-red-500' : 'text-text-main'
            }`}
          >
            {label}
            {required && <Text className="text-red-500"> *</Text>}
          </Text>
        )}

        {/* Input Container */}
        <View
          className={`flex-row items-center border rounded-lg px-3 py-1 bg-white ${
            isFocused
              ? 'border-blue-500'
              : error
              ? 'border-red-500'
              : 'border-gray-300'
          } ${disabled ? 'bg-gray-100' : ''}`}
        >
          {/* Text Input */}
          <TextInput
            ref={ref}
            className={`flex-1 text-sm ${
              disabled ? 'text-text-muted' : 'text-text-main'
            }`}
            value={value}
            onChangeText={onChangeText}
            placeholder={placeholder}
            placeholderTextColor={disabled ? '#D1D5DB' : '#9CA3AF'}
            secureTextEntry={displaySecure}
            keyboardType={
              isNumeric ? 'numeric' : isPhone ? 'phone-pad' : props.keyboardType
            } // Updated logic
            editable={!disabled}
            onFocus={handleFocus}
            onBlur={handleBlur}
            multiline={numberOfLines > 1} // Enable multiline if numberOfLines > 1
            numberOfLines={numberOfLines} // Pass the number of lines to TextInput
            {...props}
          />

          {/* Password Toggle (only for password fields) */}
          {isPassword && (
            <TouchableOpacity onPress={togglePassword} disabled={disabled}>
              <Icon
                name={showPassword ? 'eye-outline' : 'eye-off-outline'}
                size={20}
                color={disabled ? '#D1D5DB' : '#666'}
              />
            </TouchableOpacity>
          )}
        </View>

        {/* Error Message */}
        {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
      </View>
    );
  },
);

AppInput.displayName = 'AppInput';

export default AppInput;
