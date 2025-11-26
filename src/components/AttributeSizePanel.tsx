import React from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AppDropdown from './ui/AppDropdown';
import DimensionInputs from './DimensionInputs';
import type { Attribute } from '../types/Category';

interface Props {
  attributes: Attribute[];
  values: Record<string, string>;
  onChange: (id: string, value: string) => void;
  isLoading?: boolean;
}

const AttributeSizePanel: React.FC<Props> = ({
  attributes,
  values,
  onChange,
  isLoading = false,
}) => {
  if (isLoading) return <ActivityIndicator size="small" color="#e85a4f" />;

  if (!attributes || attributes.length === 0) {
    return (
      <View className="mt-4 flex-row items-center justify-center">
        <Text className="text-sm text-gray-600">Chưa có dữ liệu</Text>
      </View>
    );
  }

  const lengthAttr = attributes.find(a => /chiều\s+dài/i.test(a.name || ''));
  const widthAttr = attributes.find(a => /chiều\s+rộng/i.test(a.name || ''));
  const heightAttr = attributes.find(a => /chiều\s+cao/i.test(a.name || ''));
  const allDimsPresent = Boolean(lengthAttr && widthAttr && heightAttr);

  return (
    <View>
      <Text className="text-sm font-semibold mb-3 text-primary-100">
        Kích thước
        <Text className="text-red-500"> *</Text>
      </Text>
      {allDimsPresent && (
        <DimensionInputs
          lengthAttr={lengthAttr!}
          widthAttr={widthAttr!}
          heightAttr={heightAttr!}
          values={values}
          onChange={onChange}
        />
      )}

      {/* render other attributes (excluding dims if present) */}
      {(() => {
        const dimIds = new Set<string>();
        if (lengthAttr) dimIds.add(lengthAttr.id);
        if (widthAttr) dimIds.add(widthAttr.id);
        if (heightAttr) dimIds.add(heightAttr.id);

        return attributes
          .filter(attribute => !dimIds.has(attribute.id))
          .map(attribute => {
            const unitMatch = (attribute.name || '').match(/\(([^)]+)\)/);
            const unit = unitMatch
              ? unitMatch[1]
              : (attribute.name || '').trim().split(/\s+/).slice(-1)[0] || '';

            const options = [
              {
                id: `${attribute.id}_lt5`,
                name: `Nhỏ hơn 5 ${unit}`,
                value: 4,
              },
              {
                id: `${attribute.id}_5to10`,
                name: `Từ 5 ${unit} đến 10 ${unit}`,
                value: 6,
              },
              {
                id: `${attribute.id}_gt10`,
                name: `Lớn hơn 10 ${unit}`,
                value: 11,
              },
            ];

            const selectedValue = values[attribute.id] || null;
            let selectedOption: any = null;
            if (selectedValue) {
              try {
                const parsedSel = JSON.parse(selectedValue);
                selectedOption =
                  options.find(
                    o => String(o.value) === String(parsedSel.value),
                  ) || null;
              } catch (e) {
                selectedOption =
                  options.find(
                    o => String(o.value) === String(selectedValue),
                  ) || null;
              }
            }

            return (
              <View key={attribute.id}>
                <AppDropdown
                  inlineLabel={true}
                  size="sub"
                  compact={true}
                  title={attribute.name}
                  options={options as any}
                  value={selectedOption as any}
                  onSelect={(opt: any) =>
                    onChange(
                      attribute.id,
                      JSON.stringify({ value: opt.value, label: opt.name }),
                    )
                  }
                />
              </View>
            );
          });
      })()}
    </View>
  );
};

export default AttributeSizePanel;
