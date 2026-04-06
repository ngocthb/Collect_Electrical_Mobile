import React, { useEffect, useMemo, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  TouchableOpacity,
  ActivityIndicator,
  useWindowDimensions,
} from 'react-native';
import { BarChart } from 'react-native-chart-kit';
import { useNavigation } from '@react-navigation/native';
import SubLayout from '../../layout/SubLayout';
import { useAppSelector } from '../../store/hooks';
import { getStatistics } from '../../services/collectorService';

type StatisticChartItem = {
  label: string;
  value: number;
};

type StatisticsData = {
  totalOrders: number;
  completedOrders: number;
  failedOrders: number;
  completedChart: StatisticChartItem[];
  failedChart: StatisticChartItem[];
};

const emptyStatistics: StatisticsData = {
  totalOrders: 0,
  completedOrders: 0,
  failedOrders: 0,
  completedChart: [],
  failedChart: [],
};

export default function DeliveryStats() {
  const user = useAppSelector(s => s.auth.user);
  const userId = user?.userId;
  const navigation = useNavigation<any>();
  const { width: screenWidth } = useWindowDimensions();

  const [mode, setMode] = useState<'week' | 'month'>('week');
  const [loading, setLoading] = useState(false);
  const [statistics, setStatistics] = useState<StatisticsData>(emptyStatistics);

  const period = mode === 'week' ? 0 : 1;

  useEffect(() => {
    let mounted = true;

    const fetchStatistics = async () => {
      if (!userId) {
        setStatistics(emptyStatistics);
        return;
      }

      setLoading(true);
      try {
        const response = await getStatistics(String(userId), period);
        const payload = response?.data?.data ?? response?.data ?? null;

        if (!mounted) return;

        setStatistics({
          totalOrders: payload?.totalOrders ?? 0,
          completedOrders: payload?.completedOrders ?? 0,
          failedOrders: payload?.failedOrders ?? 0,
          completedChart: payload?.completedChart ?? [],
          failedChart: payload?.failedChart ?? [],
        });
      } catch (error) {
        console.error('[DeliveryStats] Error loading statistics:', error);
        if (mounted) setStatistics(emptyStatistics);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchStatistics();

    return () => {
      mounted = false;
    };
  }, [userId, period]);

  const labels = useMemo(() => {
    if (statistics.completedChart.length > 0) {
      return statistics.completedChart.map(item => item.label);
    }

    if (statistics.failedChart.length > 0) {
      return statistics.failedChart.map(item => item.label);
    }

    return [];
  }, [statistics.completedChart, statistics.failedChart]);

  const completed = useMemo(
    () => statistics.completedChart.map(item => item.value),
    [statistics.completedChart],
  );

  const failed = useMemo(
    () => statistics.failedChart.map(item => item.value),
    [statistics.failedChart],
  );

  const totalOrders =
    statistics.totalOrders ||
    statistics.completedOrders + statistics.failedOrders;

  const chartConfig = {
    backgroundGradientFrom: '#ffffff',
    backgroundGradientTo: '#ffffff',
    fillShadowGradient: '#e85a4f',
    fillShadowGradientOpacity: 1,
    color: (opacity = 1) => `rgba(0,0,0,${opacity})`,
    strokeWidth: 2,
    barPercentage: 0.5,
    decimalPlaces: 0,
  };

  const chartData = {
    labels,
    datasets: [
      {
        data: completed,
        colors: [(opacity = 1) => `rgba(232, 90, 79, ${opacity})`],
      },
    ],
  };

  const failedChartData = {
    labels,
    datasets: [
      {
        data: failed,
        colors: [(opacity = 1) => `rgba(232, 90, 79, ${opacity * 0.5})`],
      },
    ],
  };

  const renderChart = (data: any, emptyText: string) => {
    if (loading) {
      return (
        <View className="py-10 items-center justify-center">
          <ActivityIndicator size="small" color="#e85a4f" />
        </View>
      );
    }

    if (!data || data.datasets[0].data.length === 0) {
      return (
        <View className="py-10 items-center justify-center">
          <Text className="text-sm text-gray-500">{emptyText}</Text>
        </View>
      );
    }

    return (
      <BarChart
        data={data}
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
    );
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
                : undefined
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
                : undefined
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
          {loading ? (
            <View className="py-8 items-center justify-center">
              <ActivityIndicator size="small" color="#e85a4f" />
            </View>
          ) : (
            <View className="flex-row justify-between">
              <View className="items-center flex-1">
                <Text className="text-xl font-bold">{totalOrders}</Text>
                <Text className="text-sm text-gray-500">Tổng đơn</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-xl font-bold">
                  {statistics.completedOrders}
                </Text>
                <Text className="text-sm text-gray-500">Hoàn thành</Text>
              </View>
              <View className="items-center flex-1">
                <Text className="text-xl font-bold">
                  {statistics.failedOrders}
                </Text>
                <Text className="text-sm text-gray-500">Thất bại</Text>
              </View>
            </View>
          )}
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm mb-4 mt-4">
          <Text className="text-sm text-gray-600 mb-2">
            Số đơn (Hoàn thành)
          </Text>
          {renderChart(chartData, 'Không có dữ liệu')}
        </View>

        <View className="bg-white rounded-lg p-4 shadow-sm ">
          <Text className="text-sm text-gray-600 mb-2">Số đơn (Thất bại)</Text>
          {renderChart(failedChartData, 'Không có dữ liệu')}
        </View>
      </ScrollView>
    </SubLayout>
  );
}
