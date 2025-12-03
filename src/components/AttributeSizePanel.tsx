import React, { useEffect, useState } from 'react';
import { View, Text, ActivityIndicator } from 'react-native';
import AppDropdown from './ui/AppDropdown';
import DimensionInputs from './DimensionInputs';
import type {
  Attribute,
  AttributeOptionData,
  AttributeOption,
} from '../types/Category';

import { getAttributeOptions } from '../services/categoryService';
import { getAttributes } from '../services/categoryService';
interface Props {
  subCategoryId?: string;
  onChange?: (data: AttributeOptionData) => void;
  values?: AttributeOption;
}

const AttributeSizePanel: React.FC<Props> = ({
  subCategoryId,
  onChange,
  values,
}) => {
  const [attributeOptions, setAttributeOptions] = useState<
    Record<string, AttributeOption[]>
  >({});
  const [loadingOptions, setLoadingOptions] = useState(false);
  const [dimensions, setDimensions] = useState<Attribute[]>([]);
  const [fetchedAttributes, setFetchedAttributes] = useState<Attribute[]>([]);

  const handleGetAttributes = async () => {
    if (!subCategoryId) return;
    setLoadingOptions(true);
    try {
      const attrs = await getAttributes(subCategoryId);

      const lengthAttr = attrs.find(a => /chiều\s+dài/i.test(a.name || ''));
      const widthAttr = attrs.find(a => /chiều\s+rộng/i.test(a.name || ''));
      const heightAttr = attrs.find(a => /chiều\s+cao/i.test(a.name || ''));

      const dimensions = [lengthAttr, widthAttr, heightAttr].filter(
        Boolean,
      ) as Attribute[];

      setDimensions(dimensions);
      const otherAttributes = attrs.filter(a => !dimensions.includes(a));

      setFetchedAttributes(attrs);

      const optionsMap: Record<string, AttributeOption[]> = {};
      for (const attr of otherAttributes) {
        try {
          const options = await getAttributeOptions(attr.id);
          optionsMap[attr.id] = options;
        } catch (e) {
          console.warn(`Failed to fetch options for attribute ${attr.id}`, e);
          optionsMap[attr.id] = [];
        }
      }
      setAttributeOptions(optionsMap);
    } catch (e) {
      console.error('Failed to fetch attributes for subcategory', e);
    } finally {
      setLoadingOptions(false);
    }
  };

  useEffect(() => {
    if (subCategoryId) {
      handleGetAttributes();
    }
  }, [subCategoryId]);

  if (loadingOptions) return <ActivityIndicator size="small" color="#e85a4f" />;

  if (!fetchedAttributes || fetchedAttributes.length === 0) {
    return (
      <View className="mt-4 flex-row items-center justify-center">
        <Text className="text-sm text-gray-600">Chưa có dữ liệu</Text>
      </View>
    );
  }

  return (
    <View>
      <Text className="text-sm font-semibold mb-3 text-primary-100">
        Kích thước
        <Text className="text-red-500"> *</Text>
      </Text>
      {dimensions.length > 0 && (
        <DimensionInputs attributes={dimensions} onChange={onChange} />
      )}

      {attributeOptions && Object.keys(attributeOptions).length > 0 && (
        <>
          {Object.entries(attributeOptions).map(([attrId, options]) => {
            const attribute =
              fetchedAttributes.find(a => a.id === attrId) ||
              fetchedAttributes.find(a => a.id === attrId);
            if (!attribute) return null;
            const selectedValue =
              values?.attributeOptionId === attrId ? values : null;
            return (
              <AppDropdown
                key={attrId}
                inlineLabel={true}
                size="sub"
                compact={true}
                title={attribute.name}
                options={options as AttributeOption[]}
                value={selectedValue as any}
                onSelect={opt =>
                  onChange &&
                  onChange({
                    attributeId: attribute.id,
                    optionId: opt.attributeOptionId,
                    value: null,
                  })
                }
              />
            );
          })}
        </>
      )}
    </View>
  );
};

export default AttributeSizePanel;
