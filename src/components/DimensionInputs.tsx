import React, { useEffect } from 'react';
import { View, Text } from 'react-native';
import AppInput from './ui/AppInput';
import type { Attribute } from '../types/Category';

interface Props {
  lengthAttr: Attribute;
  widthAttr: Attribute;
  heightAttr: Attribute;
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
}

const DimensionInputs: React.FC<Props> = ({
  lengthAttr,
  widthAttr,
  heightAttr,
  values,
  onChange,
}) => {
  useEffect(() => {
    // debug: log which dimension attribute ids are being used
    console.log('DimensionInputs mounted with ids:', {
      lengthId: lengthAttr.id,
      widthId: widthAttr.id,
      heightId: heightAttr.id,
    });
  }, [lengthAttr.id, widthAttr.id, heightAttr.id]);
  const unitMatch = (lengthAttr.name || '').match(/\(([^)]+)\)/);
  const unit = unitMatch
    ? unitMatch[1]
    : (lengthAttr.name || '').trim().split(/\s+/).slice(-1)[0] || '';

  return (
    <View>
      <View className="flex-row items-center">
        {/* Fixed-width label column */}
        <View className="w-1/3">
          <Text className="text-sm font-medium text-text-sub items-center text-start">
            Dài x Rộng x Cao {unit ? `(${unit})` : ''}
          </Text>
        </View>

        {/* Inputs row: 3 compact inputs share remaining space */}
        <View className="flex-row w-2/3 items-center">
          <View style={{ flex: 1, marginRight: 6 }}>
            <AppInput
              compact
              showStepper
              min={0}
              placeholder="Dài"
              required
              isNumeric
              value={values[lengthAttr.id] || ''}
              onChangeText={t => {
                const v = String(t ?? '');
                console.log('DimensionInputs change', lengthAttr.id, v);
                onChange(lengthAttr.id, v);
              }}
            />
          </View>

          <View style={{ flex: 1, marginRight: 6 }}>
            <AppInput
              compact
              showStepper
              min={0}
              placeholder="Rộng"
              required
              isNumeric
              value={values[widthAttr.id] || ''}
              onChangeText={t => {
                const v = String(t ?? '');
                console.log('DimensionInputs change', widthAttr.id, v);
                onChange(widthAttr.id, v);
              }}
            />
          </View>

          <View style={{ flex: 1 }}>
            <AppInput
              compact
              showStepper
              min={0}
              placeholder="Cao"
              required
              isNumeric
              value={values[heightAttr.id] || ''}
              onChangeText={t => {
                const v = String(t ?? '');
                console.log('DimensionInputs change', heightAttr.id, v);
                onChange(heightAttr.id, v);
              }}
            />
          </View>
        </View>
      </View>
    </View>
  );
};

export default DimensionInputs;
