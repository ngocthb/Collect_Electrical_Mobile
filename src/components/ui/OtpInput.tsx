import React, { useRef, useState } from 'react';
import {
  View,
  TextInput,
  NativeSyntheticEvent,
  TextInputKeyPressEventData,
} from 'react-native';

interface OtpInputProps {
  length?: number;
  onComplete?: (code: string) => void;
  onChange?: (code: string) => void;
  value?: string;
  onSubmitEditing?: () => void;
}

const OtpInput: React.FC<OtpInputProps> = ({
  length = 6,
  onComplete,
  onChange,
  value = '',
  onSubmitEditing,
}) => {
  const inputsRef = useRef<Array<TextInput | null>>(
    Array.from({ length: length }, () => null),
  );
  const [digits, setDigits] = useState<string[]>(
    Array.from({ length }, (_, i) => value[i] || ''),
  );

  const handleChange = (index: number) => (text: string) => {
    // Extract only digits
    const numericValue = text.replace(/[^0-9]/g, '');

    // If empty text and current digit exists, it's a deletion
    if (!numericValue && digits[index]) {
      const next = [...digits];
      next[index] = '';
      setDigits(next);
      onChange?.(next.join(''));
      if (index > 0) inputsRef.current[index - 1]?.focus();
      return;
    }

    // If no numeric value, do nothing
    if (!numericValue) return;

    // Take only the last digit entered
    const digit = numericValue.charAt(numericValue.length - 1);

    // Update the digits array
    const next = [...digits];
    next[index] = digit;
    setDigits(next);

    const code = next.join('');
    onChange?.(code);

    // Auto-focus to next input if not the last one
    if (index < length - 1) {
      setTimeout(() => {
        inputsRef.current[index + 1]?.focus();
      }, 10);
    } else {
      // Last digit entered
      if (code.length === length) {
        onComplete?.(code);
      }
    }
  };

  const handleKeyPress =
    (index: number) =>
    (e: NativeSyntheticEvent<TextInputKeyPressEventData>) => {
      const key = e.nativeEvent.key;
      // If user pressed backspace on an empty input, move focus to previous and clear it
      if (key === 'Backspace') {
        if (digits[index] === '' && index > 0) {
          const prev = [...digits];
          prev[index - 1] = '';
          setDigits(prev);
          onChange?.(prev.join(''));
          inputsRef.current[index - 1]?.focus();
        } else if (digits[index] !== '') {
          // If current has a digit, clear it (keeps focus on current)
          const next = [...digits];
          next[index] = '';
          setDigits(next);
          onChange?.(next.join(''));
        }
      }
    };

  const clearInputs = () => {
    const empty = Array.from({ length }, () => '');
    setDigits(empty);
    onChange?.('');
    inputsRef.current[0]?.focus();
  };

  return (
    <View className="flex-row w-full justify-between px-6">
      {Array.from({ length }).map((_, i) => (
        <TextInput
          key={i}
          ref={r => {
            inputsRef.current[i] = r;
          }}
          value={digits[i]}
          onChangeText={handleChange(i)}
          onKeyPress={handleKeyPress(i)}
          onSubmitEditing={
            i === length - 1
              ? () => {
                  onComplete?.(digits.join(''));
                  onSubmitEditing?.();
                }
              : undefined
          }
          blurOnSubmit={i === length - 1}
          keyboardType="number-pad"
          maxLength={1}
          className="w-8 h-14 border-b-2 text-center text-xl"
          style={{ borderColor: '#e5e7eb' }}
          returnKeyType={i === length - 1 ? 'done' : 'next'}
        />
      ))}
    </View>
  );
};

export default OtpInput;
