import React, { useState, useEffect } from 'react';
import { Modal, View, Text, TouchableOpacity, Pressable } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

export type Badge = { id: string; label: string };

interface BadgeModalProps {
  visible: boolean;
  initialSelected?: string[];
  onClose: () => void;
  onConfirm: (selected: string[]) => void;
}

export const DEFAULT_BADGES: Badge[] = [
  { id: 'cancel_reason_delay', label: 'Khách hàng không có nhà' },
  { id: 'cancel_reason_damaged', label: 'Hàng hư hỏng' },
  { id: 'cancel_reason_other', label: 'Lý do khác' },
  { id: 'cancel_reason_refuse', label: 'Khách từ chối đưa hàng' },
];

export default function BadgeModal({
  visible,
  initialSelected = [],
  onClose,
  onConfirm,
}: BadgeModalProps) {
  const [selected, setSelected] = useState<string[]>(initialSelected || []);

  useEffect(() => {
    setSelected(initialSelected || []);
  }, [initialSelected, visible]);

  const toggle = (id: string) => {
    setSelected(prev =>
      prev.includes(id) ? prev.filter(p => p !== id) : [...prev, id],
    );
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <View className="flex-1 bg-black/50 justify-center items-center p-5">
        <View className="w-full bg-white rounded-xl p-4">
          <Text className="text-base font-bold text-gray-900">Lí do hủy</Text>
          <Text className="text-sm text-gray-500 mt-2">
            Chọn một hoặc nhiều nhãn mô tả lý do hủy
          </Text>

          <View className="mt-3">
            {DEFAULT_BADGES.map(b => {
              const active = selected.includes(b.id);
              return (
                <TouchableOpacity
                  key={b.id}
                  onPress={() => toggle(b.id)}
                  className="flex-row items-center py-3"
                >
                  <View
                    className={`w-7 h-7 rounded-md border mr-3 items-center justify-center ${
                      active ? 'bg-red-600 border-red-600' : 'border-gray-200'
                    }`}
                  >
                    {active && <Icon name="check" size={14} color="#fff" />}
                  </View>
                  <Text className="text-base text-gray-800">{b.label}</Text>
                </TouchableOpacity>
              );
            })}
          </View>

          <View className="flex-row justify-end mt-4">
            <Pressable onPress={onClose} className="px-4 py-2 mr-3">
              <Text className="text-sm text-gray-600">Hủy</Text>
            </Pressable>
            <Pressable
              onPress={() => onConfirm(selected)}
              className="bg-red-600 px-4 py-2 rounded-md"
            >
              <Text className="text-sm text-white font-bold">Lưu</Text>
            </Pressable>
          </View>
        </View>
      </View>
    </Modal>
  );
}
