import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  TextInput,
  ActivityIndicator,
  TouchableWithoutFeedback,
} from 'react-native';
import {
  getSubcategories,
  getBrandsBySubcategory,
} from '../../services/categoryService';
import Icon from 'react-native-vector-icons/Feather';

interface SubCategory {
  id: string;
  name: string;
  parentCategoryId?: string;
  [key: string]: any;
}

interface Brand {
  brandId: string;
  name: string;
  categoryId?: string;
  [key: string]: any;
}

interface Props {
  type: 'subcategory' | 'brand';
  parentCategoryId?: string; // required when type === 'subcategory'
  subCategoryId?: string; // required when type === 'brand'
  onChange?: (item: SubCategory | Brand | null) => void;
}

const AppSearchableDropdown: React.FC<Props> = ({
  type,
  parentCategoryId,
  subCategoryId,
  onChange,
}) => {
  const [loading, setLoading] = useState(false);
  const [items, setItems] = useState<Array<SubCategory | Brand>>([]);
  const [filtered, setFiltered] = useState<Array<SubCategory | Brand>>([]);
  const [query, setQuery] = useState('');
  const [selected, setSelected] = useState<SubCategory | Brand | null>(null);
  const [isOpen, setIsOpen] = useState(false);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        if (type === 'subcategory') {
          if (!parentCategoryId) {
            setItems([]);
            setFiltered([]);
            return;
          }
          const res = await getSubcategories(parentCategoryId);
          if (!mounted) return;
          setItems(res || []);
          setFiltered(res || []);
        } else {
          // brand
          if (!subCategoryId) {
            setItems([]);
            setFiltered([]);
            return;
          }
          const res = await getBrandsBySubcategory(subCategoryId);
          if (!mounted) return;
          setItems(res || []);
          setFiltered(res || []);
        }
      } catch (e) {
        console.warn('[AppSearchableDropdown] failed to load items', e);
        if (mounted) {
          setItems([]);
          setFiltered([]);
        }
      } finally {
        if (mounted) setLoading(false);
      }
    };
    load();
    return () => {
      mounted = false;
    };
  }, [type, parentCategoryId, subCategoryId]);

  useEffect(() => {
    if (onChange) onChange(selected);
  }, [selected]);

  const handleSelect = (item: SubCategory | Brand) => {
    setSelected(item);
    setQuery((item as any).name || '');
    setIsOpen(false);
    setFiltered(items);
  };

  const handleSearch = (text: string) => {
    setQuery(text);
    setIsOpen(true);
    if (!text) {
      setFiltered(items);
      return;
    }
    const q = text.toLowerCase();
    setFiltered(
      items.filter(i => ((i.name || '') as string).toLowerCase().includes(q)),
    );
  };

  const handleClear = () => {
    setSelected(null);
    setQuery('');
    setFiltered(items);
    setIsOpen(false);
  };

  const displayLabel =
    type === 'subcategory' ? 'Chọn danh mục con' : 'Chọn thương hiệu';

  return (
    <TouchableWithoutFeedback onPress={() => setIsOpen(false)}>
      <View className="mb-4">
        <Text className="text-sm font-semibold mb-2 text-primary-100">
          {displayLabel} <Text className="text-red-500"> *</Text>
        </Text>

        <TouchableWithoutFeedback>
          <View style={{ position: 'relative', width: '100%' }}>
            <TextInput
              value={query}
              onChangeText={handleSearch}
              onFocus={() => setIsOpen(true)}
              placeholder={`Tìm kiếm ${
                type === 'subcategory' ? 'danh mục con' : 'thương hiệu'
              }`}
              placeholderTextColor="#9CA3AF"
              className="border border-gray-300 rounded-lg px-4 py-2.5 bg-white pr-11 text-text-main"
            />

            {selected && query && (
              <TouchableOpacity
                onPress={handleClear}
                style={{
                  position: 'absolute',
                  right: 12,
                  top: '50%',
                  transform: [{ translateY: -10 }],
                  width: 24,
                  alignItems: 'center',
                  justifyContent: 'center',
                  zIndex: 10,
                }}
              >
                <Icon name="x" size={20} color="#9CA3AF" />
              </TouchableOpacity>
            )}
          </View>
        </TouchableWithoutFeedback>

        {isOpen && (
          <TouchableWithoutFeedback>
            <View className="bg-white border border-gray-200 rounded-lg mt-2 max-h-60">
              {loading ? (
                <View className="p-4 items-center">
                  <ActivityIndicator />
                </View>
              ) : (
                <ScrollView nestedScrollEnabled style={{ maxHeight: 240 }}>
                  {filtered.length === 0 ? (
                    <View className="p-4 items-center">
                      <Text className="text-gray-500">Không có dữ liệu</Text>
                    </View>
                  ) : (
                    filtered.map(item => {
                      const itemId = (item as any).id || (item as any).brandId;
                      const picked = !!(
                        selected &&
                        ((selected as any).id || (selected as any).brandId) ===
                          itemId
                      );
                      return (
                        <TouchableOpacity
                          key={String(itemId)}
                          onPress={() => handleSelect(item)}
                          className={`px-4 py-3 border-b border-gray-100 ${
                            picked ? 'bg-red-100' : ''
                          }`}
                        >
                          <Text className="text-gray-900">
                            {(item as any).name}
                          </Text>
                        </TouchableOpacity>
                      );
                    })
                  )}
                </ScrollView>
              )}
            </View>
          </TouchableWithoutFeedback>
        )}
      </View>
    </TouchableWithoutFeedback>
  );
};

export default AppSearchableDropdown;
