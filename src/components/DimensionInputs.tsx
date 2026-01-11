import React, { useEffect, useState } from 'react';
import { View, Text } from 'react-native';
import AppInput from './ui/AppInput';
import type { Attribute, AttributeOptionData } from '../types/Category';

interface Props {
  attributes: Attribute[];
  onChange?: (data: AttributeOptionData) => void;
  initialValues?: Record<string, number | string>;
}

const DimensionInputs: React.FC<Props> = ({
  attributes,
  onChange,
  initialValues = {},
}) => {
  const initialMap: Record<string, string> = {};
  for (const a of attributes) {
    console.log(a);
    initialMap[a.id] = String(initialValues[a.id] ?? a.minValue);
  }

  const [valuesMap, setValuesMap] =
    useState<Record<string, string>>(initialMap);

  const getShortLabel = (name = '') => {
    if (/chiều\s+dài/i.test(name)) return 'Dài';
    if (/chiều\s+rộng/i.test(name)) return 'Rộng';
    if (/chiều\s+cao/i.test(name)) return 'Cao';

    return name.trim().split(/\s+/)[0] || '';
  };

  const getUnit = (name = '') => {
    const unitMatch = (name || '').match(/\(([^)]+)\)/);
    if (unitMatch) return unitMatch[1];
    const parts = (name || '').trim().split(/\s+/);
    return parts.slice(-1)[0] || '';
  };

  const handleChange = (attributeId: string, text: string) => {
    const next = { ...valuesMap, [attributeId]: text };
    setValuesMap(next);
    if (onChange) {
      const num = Number(text);
      onChange({ attributeId, optionId: null, value: isNaN(num) ? 0 : num });
    }
  };
  const handleBlur = (attribute: Attribute) => {
    const value = Number(valuesMap[attribute.id]);
    let adjustedValue = value;

    if (value < attribute.minValue) {
      adjustedValue = attribute.minValue;
      setValuesMap(prev => ({
        ...prev,
        [attribute.id]: attribute.minValue.toString(),
      }));
    } else if (value > 99999) {
      adjustedValue = 99999;
      setValuesMap(prev => ({ ...prev, [attribute.id]: '99999' }));
    }

    // Trả về giá trị đã điều chỉnh
    if (onChange && adjustedValue !== value) {
      const attributeId = attribute.id;
      onChange({ attributeId, optionId: null, value: adjustedValue });
    }
  };
  if (!attributes || attributes.length === 0) return null;

  const commonUnit = getUnit(attributes[0].name || '');

  return (
    <View className="flex mb-2">
      <View className="flex-row items-center justify-between">
        <View className="w-2/5">
          <Text className="text-sm font-medium text-text-sub">
            Dài x Rộng x Cao {commonUnit ? `(${commonUnit})` : ''}
          </Text>
        </View>
        <View className="flex-1">
          <View className="flex-row w-full items-center">
            {attributes.map((attr, idx) => (
              <View
                key={attr.id}
                style={{
                  flex: 1,
                  marginRight: idx < attributes.length - 1 ? 6 : 0,
                }}
              >
                <AppInput
                  compact
                  showStepper
                  placeholder={getShortLabel(attr.name)}
                  required
                  isNumeric
                  value={valuesMap[attr.id]}
                  onChangeText={t => handleChange(attr.id, String(t ?? ''))}
                  onBlur={() => handleBlur(attr)}
                />
              </View>
            ))}
          </View>
        </View>
      </View>
      <Text className="text-primary-50 text-xs font-semibold">
        * Vui lòng nhập kích thước gần đúng với thực tế
      </Text>
    </View>
  );
};

export default DimensionInputs;
