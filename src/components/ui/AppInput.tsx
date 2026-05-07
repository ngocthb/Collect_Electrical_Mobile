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
  inlineLabel?: boolean;
  isPhone?: boolean;
  isEmail?: boolean;
  isNumeric?: boolean;
  showStepper?: boolean;
  step?: number;
  min?: number;
  max?: number;
  compact?: boolean;
  numberOfLines?: number;
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
      numberOfLines = 1,
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

    const handleNumericChange = (text: string) => {
      if (!onChangeText) return;

      if (text === '') {
        onChangeText('');
        return;
      }

      const numericValue = text.replace(/[^0-9.]/g, '');

      const parsedValue = parseFloat(numericValue);

      if (isNaN(parsedValue)) {
        return;
      }

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
          multiline={numberOfLines > 1}
          style={{
            minHeight: compact ? (30 * height) / 812 : (40 * height) / 812,
            paddingVertical: compact ? 4 : 8,
            lineHeight: compact ? 16 : 20,
          }}
          numberOfLines={numberOfLines}
          {...props}
        />

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

            {renderInputContainer()}
          </>
        )}

        {error && <Text className="text-xs text-red-500 mt-1">{error}</Text>}
      </View>
    );
  },
);

AppInput.displayName = 'AppInput';

export default AppInput;
