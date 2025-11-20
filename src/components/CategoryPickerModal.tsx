import React, { useEffect, useState } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
  Pressable,
  Dimensions,
  ScrollView,
} from 'react-native';
import { getParentCategories } from '../services/categoryService';
import AppButton from './ui/AppButton';
import Icon from 'react-native-vector-icons/Feather';

type Category = {
  id: string;
  name: string;
  parentCategoryId: string | null;
};

interface Props {
  visible: boolean;
  onClose: () => void;
  onConfirm: (category: Category) => void;
}

export default function CategoryPickerModal({
  visible,
  onClose,
  onConfirm,
}: Props) {
  const [selected, setSelected] = useState<string | null>(null);
  const [categories, setCategories] = useState<Category[]>([]);
  const [loading, setLoading] = useState(false);
  const [error, setError] = useState<string | null>(null);
  const [selecting, setSelecting] = useState(false);

  const screenHeight = Dimensions.get('window').height;
  const minHeight = screenHeight / 3;

  useEffect(() => {
    let mounted = true;
    const fetch = async () => {
      setLoading(true);
      setError(null);
      try {
        const data = (await getParentCategories()) as any;
        if (!mounted) return;
        setCategories(data || []);
      } catch (e: any) {
        console.error('CategoryPickerModal: failed to fetch', e);
        if (mounted) setError('Không thể tải danh mục');
      } finally {
        if (mounted) setLoading(false);
      }
    };

    if (visible) fetch();
    return () => {
      mounted = false;
    };
  }, [visible]);

  useEffect(() => {
    if (!visible) {
      setSelected(null);
      setSelecting(false);
    }
  }, [visible]);

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        style={{
          flex: 1,
          justifyContent: 'flex-end',
          backgroundColor: 'rgba(0,0,0,0.5)',
        }}
        onPress={onClose}
      >
        <View
          style={{
            width: '100%',
            backgroundColor: '#fff',
            borderTopLeftRadius: 16,
            borderTopRightRadius: 16,
            padding: 16,
            paddingBottom: 24,
            maxHeight: '80%',
            minHeight: minHeight,
          }}
        >
          <View className="pb-2 mb-4 relative">
            <Text className="text-sm font-semibold text-gray-900 text-center">
              Chọn danh mục
            </Text>

            {/* Close Button */}
            <TouchableOpacity
              onPress={onClose}
              className="absolute top-0 right-0 w-8 h-8 bg-gray-100   rounded-full items-center justify-center"
            >
              <Icon name="x" size={20} color="#6b7280" />
            </TouchableOpacity>
          </View>

          {loading ? (
            <View
              className="items-center justify-center"
              style={{ minHeight: minHeight - 100 }} // Account for header and padding
            >
              <ActivityIndicator size="large" color="#3B82F6" />
              <Text className="text-gray-600 mt-2">Đang tải danh mục...</Text>
            </View>
          ) : error ? (
            <View
              className="items-center justify-center"
              style={{ minHeight: minHeight - 100 }} // Account for header and padding
            >
              <Text className="text-sm text-red-600 text-center">{error}</Text>
              <TouchableOpacity
                onPress={() => {
                  setError(null);
                }}
                className="mt-4 px-4 py-2 bg-blue-500 rounded-lg"
              >
                <Text className="text-white font-medium">Thử lại</Text>
              </TouchableOpacity>
            </View>
          ) : (
            <>
              <ScrollView style={{ minHeight: 250, maxHeight: 400 }}>
                {categories.map(cat => {
                  return (
                    <TouchableOpacity
                      key={cat.id}
                      onPress={() => setSelected(cat.id)}
                      className={`flex-row items-center py-3 px-2 rounded-lg ${
                        selected === cat.id
                          ? 'bg-blue-50 border border-blue-200'
                          : 'bg-transparent'
                      }`}
                    >
                      <View
                        className={`w-5 h-5 rounded-full border-2 mr-3 ${
                          selected === cat.id
                            ? 'bg-blue-500 border-blue-500'
                            : 'bg-white border-gray-300'
                        }`}
                      >
                        {selected === cat.id && (
                          <View className="w-full h-full items-center justify-center">
                            <Icon name="check" size={12} color="#fff" />
                          </View>
                        )}
                      </View>
                      <Text
                        className={`text-base ${
                          selected === cat.id
                            ? 'text-blue-600 font-medium'
                            : 'text-gray-800'
                        }`}
                      >
                        {cat.name}
                      </Text>
                    </TouchableOpacity>
                  );
                })}
              </ScrollView>

              {/* Chọn Button */}
              <AppButton
                title={'Chọn'}
                onPress={async () => {
                  const cat = categories.find(c => c.id === selected);
                  if (cat && !selecting) {
                    setSelecting(true);
                    try {
                      await new Promise<void>(resolve =>
                        setTimeout(() => resolve(), 500),
                      ); // Small delay for UX
                      onConfirm(cat);
                    } finally {
                      setSelecting(false);
                    }
                  }
                }}
                disabled={!selected || selecting}
                loading={selecting}
              />
            </>
          )}
        </View>
      </Pressable>
    </Modal>
  );
}
