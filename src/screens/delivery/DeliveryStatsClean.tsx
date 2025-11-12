import React, { useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import SubLayout from '../../layout/SubLayout';

// Lightweight clean stats screen (Day/Week/Month) with mocked completed/failed counts.

function getWeekdayLabels() {
  return ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
}

function lastNMonthsLabels(n = 6) {
  const now = new Date();
  const labels: string[] = [];
  for (let i = 0; i < n; i++) {
    const d = new Date(now.getFullYear(), now.getMonth() - i, 1);
    const month = d.getMonth() + 1;
    const year = String(d.getFullYear()).slice(-2);
    labels.unshift(`${month}/${year}`);
  }
  return labels;
}

function generateMockPairs(n: number, base = 10) {
  const completed: number[] = [];
  const failed: number[] = [];
  for (let i = 0; i < n; i++) {
    const a = Math.round(Math.abs(Math.sin((i + 1) * 1.2) * base) + (i % 4));
    const b = Math.round(Math.abs(Math.cos((i + 2) * 0.9) * (base / 3)));
    completed.push(a + Math.round(base / 3));
    failed.push(Math.round(b));
  }
  return { completed, failed };
}

export default function DeliveryStats() {
  const navigation = useNavigation<any>();
  const [mode, setMode] = useState<'week' | 'month'>('week');
  const [showRaw, setShowRaw] = useState(false);

  const screenWidth = Dimensions.get('window').width;

  const labels = useMemo(() => {
    if (mode === 'week') return getWeekdayLabels();
    return lastNMonthsLabels(6);
  }, [mode]);

  const { completed, failed } = useMemo(
    () => generateMockPairs(labels.length, mode === 'week' ? 18 : 24),
    [labels, mode],
  );

  const totals = {
    completed: completed.reduce((a, b) => a + b, 0),
    failed: failed.reduce((a, b) => a + b, 0),
  };

  const chartData = {
    labels,
    datasets: [
      {
        data: completed,
        color: (opacity = 1) => `rgba(34, 197, 94, ${opacity})`, // green-500
        strokeWidth: 2,
      },
    ],
  };

  const failedChartData = {
    labels,
    datasets: [
      {
        data: failed,
        color: (opacity = 1) => `rgba(239, 68, 68, ${opacity})`, // red-500
        strokeWidth: 2,
      },
    ],
  };

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    color: (opacity = 1) => `rgba(0, 0, 0, ${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    useShadowColorFromDataset: false,
    formatYLabel: (value: string) => Math.floor(parseFloat(value)).toString(),
  };

  return (
    <SubLayout
      title="Thống kê thu gom"
      onBackPress={() => navigation.goBack()}
      rightComponent={
        <View
          className="flex-row bg-gray-100 rounded-xl p-1"
          style={{ gap: 4 }}
        >
          <TouchableOpacity
            onPress={() => setMode('week')}
            className={`px-4 py-2 rounded-lg ${
              mode === 'week' ? 'bg-white' : 'bg-transparent'
            }`}
            style={
              mode === 'week'
                ? {
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                  }
                : {}
            }
          >
            <Text
              className={`text-sm font-medium ${
                mode === 'week' ? 'text-primary-100' : 'text-gray-600'
              }`}
            >
              Tuần
            </Text>
          </TouchableOpacity>
          <TouchableOpacity
            onPress={() => setMode('month')}
            className={`px-4 py-2 rounded-lg ${
              mode === 'month' ? 'bg-white' : 'bg-transparent'
            }`}
            style={
              mode === 'month'
                ? {
                    elevation: 2,
                    shadowColor: '#000',
                    shadowOffset: { width: 0, height: 1 },
                    shadowOpacity: 0.1,
                    shadowRadius: 2,
                  }
                : {}
            }
          >
            <Text
              className={`text-sm font-medium ${
                mode === 'month' ? 'text-primary-100' : 'text-gray-600'
              }`}
            >
              Tháng
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <ScrollView className="flex-1 px-6 pt-2">
        <View className="bg-white rounded-lg p-4 shadow-sm">
          <Text className="text-sm text-gray-600 mb-2">Tóm tắt</Text>
          <View className="flex-row justify-between">
            <View className="items-center">
              <Text className="text-xl font-bold">
                {totals.completed + totals.failed}
              </Text>
              <Text className="text-sm text-gray-500">Tổng đơn</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold">{totals.completed}</Text>
              <Text className="text-sm text-gray-500">Hoàn thành</Text>
            </View>
            <View className="items-center">
              <Text className="text-xl font-bold">{totals.failed}</Text>
              <Text className="text-sm text-gray-500">Thất bại</Text>
            </View>
          </View>
        </View>
        <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <Text className="text-sm text-gray-600 mb-2">
            Số đơn (Hoàn thành)
          </Text>
          <BarChart
            data={chartData}
            width={screenWidth - 86}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            yAxisLabel=""
            yAxisSuffix=""
            showValuesOnTopOfBars
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm mb-6">
          <Text className="text-sm text-gray-600 mb-2">Số đơn (Thất bại)</Text>
          <BarChart
            data={failedChartData}
            width={screenWidth - 80}
            height={220}
            chartConfig={chartConfig}
            verticalLabelRotation={30}
            yAxisLabel=""
            yAxisSuffix=""
            showValuesOnTopOfBars
            style={{
              marginVertical: 8,
              borderRadius: 16,
            }}
          />
        </View>
      </ScrollView>
    </SubLayout>
  );
}
