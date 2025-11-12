import React, { useMemo, useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity } from 'react-native';
import MainLayout from '../../layout/MainLayout';
import { useAppSelector } from '../../store/hooks';

function getWeekLabels() {
  const today = new Date();
  const labels: string[] = [];
  // start from 6 days ago -> today (7 days)
  for (let i = 6; i >= 0; i--) {
    const d = new Date(today);
    d.setDate(today.getDate() - i);
    labels.push(`${d.getDate()}/${d.getMonth() + 1}`);
  }
  return labels;
}

function getMonthLabels(last = 6) {
  const now = new Date();
  const labels: string[] = [];
  for (let i = last - 1; i >= 0; i--) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    labels.push(`${d.getMonth() + 1}/${d.getFullYear()}`);
  }
  return labels;
}

function generateMockCounts(n: number, seed = 3) {
  // deterministic-ish mock data
  const arr: number[] = [];
  for (let i = 0; i < n; i++) {
    arr.push(Math.max(0, Math.round((Math.sin((i + 1) * seed) + 1) * 10)));
  }
  return arr;
}

export default function DeliveryStatsScreen() {
  const { role } = useAppSelector(s => s.auth);
  const [mode, setMode] = useState<'week' | 'month'>('week');

  const labels = useMemo(
    () => (mode === 'week' ? getWeekLabels() : getMonthLabels(6)),
    [mode],
  );
  const counts = useMemo(
    () => generateMockCounts(labels.length, mode === 'week' ? 3 : 1.5),
    [labels, mode],
  );

  const max = Math.max(...counts, 1);

  // Only delivery users should see this screen, but be safe: show message otherwise
  if (role !== 'delivery') {
    return (
      <MainLayout>
        <View className="flex-1 items-center justify-center px-6">
          <Text className="text-gray-500">
            Trang thống kê chỉ dành cho tài xế
          </Text>
        </View>
      </MainLayout>
    );
  }

  return (
    <MainLayout>
      <ScrollView className="flex-1 px-6 pt-6">
        <Text className="text-lg font-bold mb-4">Thống kê thu gom</Text>

        <View className="flex-row items-center space-x-2 mb-4">
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${
              mode === 'week' ? 'bg-green-500' : 'bg-gray-200'
            }`}
            onPress={() => setMode('week')}
          >
            <Text
              className={`${mode === 'week' ? 'text-white' : 'text-gray-700'}`}
            >
              Tuần
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            className={`px-4 py-2 rounded-full ${
              mode === 'month' ? 'bg-green-500' : 'bg-gray-200'
            }`}
            onPress={() => setMode('month')}
          >
            <Text
              className={`${mode === 'month' ? 'text-white' : 'text-gray-700'}`}
            >
              Tháng
            </Text>
          </TouchableOpacity>
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <Text className="text-sm text-gray-600 mb-2">Số đơn hoàn thành</Text>
          <View className="flex-row items-end h-40">
            {labels.map((label, idx) => (
              <View key={label} className="flex-1 items-center mx-1">
                <View
                  style={{ height: (counts[idx] / max) * 160 }}
                  className="w-full bg-green-400 rounded-t-md"
                />
                <Text className="text-xs text-gray-600 mt-2">{label}</Text>
                <Text className="text-xs text-gray-700">{counts[idx]}</Text>
              </View>
            ))}
          </View>
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-sm text-gray-600 mb-2">Tóm tắt</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-xl font-bold">
                {counts.reduce((a, b) => a + b, 0)}
              </Text>
              <Text className="text-sm text-gray-500">Tổng hoàn thành</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold">
                {Math.round(
                  counts.reduce((a, b) => a + b, 0) / labels.length || 0,
                )}
              </Text>
              <Text className="text-sm text-gray-500">
                Trung bình /{mode === 'week' ? 'ngày' : 'tháng'}
              </Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold">{Math.max(...counts)}</Text>
              <Text className="text-sm text-gray-500">Cao nhất</Text>
            </View>
          </View>
        </View>
      </ScrollView>
    </MainLayout>
  );
}
