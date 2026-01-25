import React, { useState, forwardRef } from 'react';
import { View, TextInput, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import { TextInputProps, Dimensions } from 'react-native';

interface AppInputProps extends TextInputProps {
  label?: string;
  placeholder?: string;
  secureTextEntry?: boolean;
  error?: string;
  required?: boolean;
  disabled?: boolean;
  inlineLabel?: boolean; // nếu true thì label và input cùng hàng
  // Nếu true sẽ dùng bàn phím số (phone-pad) và một số xử lý mặc định cho số điện thoại
  isPhone?: boolean;
  isEmail?: boolean; // nếu true sẽ dùng bàn phím email
  isNumeric?: boolean; // New prop to enable numeric input
  showStepper?: boolean; // show +/- buttons for numeric adjustment
  step?: number; // step increment/decrement (default 1)
  min?: number; // optional minimum value
  max?: number; // optional maximum value
  compact?: boolean; // nếu true thì render input nhỏ hơn (padding, font-size giảm)
  numberOfLines?: number; // New prop to specify the number of lines
}
const { width, height } = Dimensions.get('window');
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
      isEmail = false,
      inlineLabel = false,
      isNumeric = false,
      showStepper = false,
      step = 1,
      min,
      max,
      compact = false,
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

    // Handle numeric input with min/max validation
    const handleNumericChange = (text: string) => {
      if (!onChangeText) return;

      // Allow empty string
      if (text === '') {
        onChangeText('');
        return;
      }

      // Remove non-numeric characters except decimal point
      const numericValue = text.replace(/[^0-9.]/g, '');

      // Parse as number
      const parsedValue = parseFloat(numericValue);

      // Check if it's a valid number
      if (isNaN(parsedValue)) {
        return;
      }

      // Apply min/max constraints
      if (min !== undefined && parsedValue < min) {
        onChangeText(min.toString());
        return;
      }

      if (max !== undefined && parsedValue > max) {
        onChangeText(max.toString());
        return;
      }

      onChangeText(numericValue);
    };

    const containerPaddingClass = compact
      ? 'px-2  rounded-md'
      : 'px-3 py-1 rounded-lg';
    const inputTextSizeClass = compact ? 'text-xs' : 'text-sm';

    const renderInputContainer = (extraClass = '') => (
      <View
        className={`flex-row items-center border bg-white ${containerPaddingClass} ${
          isFocused
            ? 'border-red-500'
            : error
            ? 'border-blue-500'
            : 'border-gray-300'
        } ${disabled ? 'bg-gray-100' : ''} ${extraClass}`}
      >
        {/* Text Input */}
        <TextInput
          ref={ref}
          className={`flex-1 ${inputTextSizeClass} ${
            disabled ? 'text-text-muted' : 'text-text-main'
          }`}
          value={value}
          onChangeText={isNumeric ? handleNumericChange : onChangeText}
          placeholder={placeholder}
          placeholderTextColor={disabled ? '#D1D5DB' : '#9CA3AF'}
          secureTextEntry={displaySecure}
          keyboardType={
            isNumeric
              ? 'numeric'
              : isPhone
              ? 'phone-pad'
              : isEmail
              ? 'email-address'
              : props.keyboardType
          }
          editable={!disabled}
          onFocus={handleFocus}
          onBlur={handleBlur}
          multiline={numberOfLines > 1} // Enable multiline if numberOfLines > 1
          style={{
            minHeight: compact ? (30 * height) / 812 : (40 * height) / 812,
            paddingVertical: compact ? 4 : 8,
            lineHeight: compact ? 16 : 20,
          }}
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
    );

    return (
      <View className="mb-4">
        {/* Inline label + input */}
        {inlineLabel ? (
          <View className="flex-row items-center">
            {label && (
              <Text
                className={`text-sm font-medium ${
                  error ? 'text-red-500' : 'text-text-main'
                }`}
              >
                {label}
                {required && <Text className="text-red-500"> *</Text>}
              </Text>
            )}

            <View className="flex-1 ml-3">{renderInputContainer()}</View>
          </View>
        ) : (
          <>
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
            {renderInputContainer()}
          </>
        )}

        {/* Error Message */}
        {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
      </View>
    );
  },
);

AppInput.displayName = 'AppInput';

export default AppInput;
