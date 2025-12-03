import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import type { AttributeOption } from '../../types/Category';

interface AppDropdownProps {
  options: AttributeOption[];
  placeholder?: string;
  onSelect: (option: AttributeOption) => void;
  title?: string;
  required?: boolean;
  value?: AttributeOption | null;
  inlineLabel?: boolean;
  size?: 'normal' | 'sub';
  compact?: boolean;
}

const AppDropdown: React.FC<AppDropdownProps> = ({
  options,
  onSelect,
  title,
  required = false,
  value,
  inlineLabel = false,
  size = 'normal',
  compact = false,
}) => {
  const [isDropdownVisible, setDropdownVisible] = useState(false);
  const [selectedOption, setSelectedOption] = useState<AttributeOption | null>(
    null,
  );

  useEffect(() => {
    if (value) {
      setSelectedOption(value);
    } else if (options.length > 0 && !selectedOption) {
      setSelectedOption(options[0]);
      onSelect(options[0]);
    }
    // eslint-disable-next-line react-hooks/exhaustive-deps
  }, [value, options]);

  const handleSelect = (option: AttributeOption) => {
    setSelectedOption(option);
    onSelect(option);
    setDropdownVisible(false);
  };

  return (
    <View style={{ marginBottom: compact ? 4 : 16, position: 'relative' }}>
      {title && inlineLabel ? (
        <View
          style={{
            flexDirection: 'row',
            alignItems: 'center',
            marginBottom: 8,
          }}
        >
          <View className="w-2/5">
            <Text className="text-sm font-medium text-text-sub items-center text-start">
              {title} {required && <Text style={{ color: 'red' }}>*</Text>}
            </Text>
          </View>
          <TouchableOpacity
            style={{
              flex: 1,
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 8,
              padding: 12,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
            }}
            onPress={() => setDropdownVisible(!isDropdownVisible)}
          >
            <Text
              style={{
                fontSize: size === 'sub' ? 12 : 16,
                color: selectedOption ? '#111827' : '#9CA3AF',
              }}
            >
              {selectedOption?.optionName}
            </Text>
            <Icon
              name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        </View>
      ) : (
        <>
          {title && (
            <Text style={{ fontSize: 14, fontWeight: '500', marginBottom: 8 }}>
              {title} {required && <Text style={{ color: 'red' }}>*</Text>}
            </Text>
          )}

          <TouchableOpacity
            style={{
              borderWidth: 1,
              borderColor: '#D1D5DB',
              borderRadius: 12,
              padding: 16,
              flexDirection: 'row',
              justifyContent: 'space-between',
              alignItems: 'center',
              backgroundColor: '#FFFFFF',
            }}
            onPress={() => setDropdownVisible(!isDropdownVisible)}
          >
            <Text
              style={{
                fontSize: 14,
                color: selectedOption ? '#111827' : '#9CA3AF',
              }}
            >
              {selectedOption?.optionName}
            </Text>
            <Icon
              name={isDropdownVisible ? 'chevron-up' : 'chevron-down'}
              size={20}
              color="#6B7280"
            />
          </TouchableOpacity>
        </>
      )}

      {isDropdownVisible && (
        <View
          style={{
            position: 'absolute',
            top: '100%',
            left: 0,
            right: 0,
            backgroundColor: '#FFFFFF',
            borderWidth: 1,
            borderColor: '#E5E7EB',
            borderRadius: 12,
            marginTop: 2,
            zIndex: 50,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: 4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 5,
          }}
        >
          <ScrollView
            style={{ maxHeight: 240 }}
            nestedScrollEnabled={true}
            showsVerticalScrollIndicator={false}
          >
            {options.map(item => (
              <TouchableOpacity
                key={String(item.attributeOptionId)}
                style={{
                  padding: size === 'sub' ? 12 : 16,
                  borderBottomWidth:
                    item !== options[options.length - 1] ? 1 : 0,
                  borderBottomColor: '#F3F4F6',
                  backgroundColor:
                    selectedOption?.attributeOptionId === item.attributeOptionId
                      ? '#FEE2E2'
                      : '#FFFFFF',
                }}
                onPress={() => handleSelect(item)}
              >
                <Text
                  style={{
                    fontSize: size === 'sub' ? 12 : 16,
                    color:
                      selectedOption?.attributeOptionId ===
                      item?.attributeOptionId
                        ? '#e85a4f'
                        : '#374151',
                    fontWeight:
                      selectedOption?.attributeOptionId ===
                      item?.attributeOptionId
                        ? '600'
                        : '400',
                  }}
                >
                  {item?.optionName}
                </Text>
              </TouchableOpacity>
            ))}
          </ScrollView>
        </View>
      )}
    </View>
  );
};

export default AppDropdown;
