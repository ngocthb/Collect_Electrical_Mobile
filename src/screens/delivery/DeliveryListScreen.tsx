import React, { useEffect, useState, useMemo, useCallback } from 'react';
import {
  FlatList,
  View,
  Text,
  TouchableOpacity,
  ActivityIndicator,
} from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import routeService from '../../services/routeService';
import WeeklyCalendar from '../../components/ui/WeeklyCalendar';
import WeekStrip from '../../components/ui/WeekStrip';
import DeliveryOrderCard from '../../components/DeliveryOrderCard';
import {
  getOrderDate,
  resolveStatus,
  statusOptions,
} from '../../utils/deliveryHelpers';
import StatusFilter from '../../components/ui/StatusFilter';
import { useAppSelector } from '../../store/hooks';
import { CollectionRouteWithDistance } from '../../types/Collector';
import MainLayout from '../../layout/MainLayout';
import { getAllConfig } from '../../services/systemConfigService';
import { setAllConfig } from '../../store/slices/systemSlice';
import { useAppDispatch } from '../../store/hooks';

export default function DeliveryListScreen() {
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showWeekCalendar, setShowWeekCalendar] = useState(false);
  const [ordersWithDistance, setOrdersWithDistance] = useState<
    CollectionRouteWithDistance[]
  >([]);
  const [dateSever, setDateServer] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [isRefreshing, setIsRefreshing] = useState(false);
  const dispatch = useAppDispatch();

  const user = useAppSelector(s => s.auth.user);
  const userId = user?.userId;

  // Memoize isSelectedDateToday để tránh tính lại mỗi lần render
  const isSelectedDateToday = useMemo(() => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const today = dateSever ? new Date(dateSever) : new Date();
    today.setHours(0, 0, 0, 0);
    return selected.getTime() === today.getTime();
  }, [selectedDate, dateSever]);

  const formatAPIDate = useCallback((date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  }, []);

  const startOfWeek = useCallback((d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday as start
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  }, []);

  const fetchOrdersByDate = useCallback(
    async (
      userId: string,
      date: Date,
      options?: {
        showLoading?: boolean;
      },
    ) => {
      const showLoading = options?.showLoading ?? true;
      if (showLoading) setIsLoading(true);
      try {
        const dateStr = formatAPIDate(date);
        const res = await routeService.listByDate(userId, dateStr);
        const orders = Array.isArray(res.data) ? res.data : [];
        setOrdersWithDistance(
          orders?.map(o => ({
            ...o,
            distanceMeters: 0,
            distanceText: '',
          })),
        );
      } catch (e) {
        console.warn('Failed to load orders', e);
        setOrdersWithDistance([]);
      } finally {
        if (showLoading) setIsLoading(false);
      }
    },
    [formatAPIDate],
  );

  useEffect(() => {
    if (userId) {
      fetchOrdersByDate(userId, selectedDate);
    }
  }, [userId, selectedDate, fetchOrdersByDate]);

  const filteredOrders = useMemo(() => {
    const selectedStart = new Date(selectedDate);
    selectedStart.setHours(0, 0, 0, 0);

    // Filter orders by date and status
    let filtered = ordersWithDistance.filter(order => {
      const orderDate = getOrderDate(order);
      if (!orderDate) return false;

      const d = new Date(orderDate);
      d.setHours(0, 0, 0, 0);

      const matchesDate = d.getTime() === selectedStart.getTime();
      const matchesStatus =
        selectedStatus === 'all' || resolveStatus(order) === selectedStatus;

      return matchesDate && matchesStatus;
    });

    // Sort orders by status
    if (selectedStatus === 'all') {
      const top: any[] = [];
      const middle: any[] = [];
      const bottom: any[] = [];

      filtered.forEach(o => {
        const s = resolveStatus(o);
        if (s === 'completed' || s === 'failed') {
          bottom.push(o);
        } else if (s === 'pending') {
          top.push(o);
        } else {
          middle.push(o);
        }
      });

      filtered = [...top, ...middle, ...bottom];
    }

    return filtered;
  }, [ordersWithDistance, selectedDate, selectedStatus]);

  const changeWeek = useCallback((weeks: number) => {
    setSelectedDate(prevDate => {
      const newDate = new Date(prevDate);
      newDate.setDate(newDate.getDate() + weeks * 7);
      return newDate;
    });
  }, []);

  const formatWeekLabel = useCallback(
    (date: Date) => {
      const s = startOfWeek(date);
      const e = new Date(s);
      e.setDate(s.getDate() + 6);
      const pad = (n: number) => String(n).padStart(2, '0');
      return `${pad(s.getDate())}/${pad(s.getMonth() + 1)} - ${pad(
        e.getDate(),
      )}/${pad(e.getMonth() + 1)}`;
    },
    [startOfWeek],
  );

  const handleSelectDate = useCallback((d: Date) => {
    setIsLoading(true); // 🔥 quan trọng
    setOrdersWithDistance([]); // optional, để clear list
    setSelectedDate(d);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
  }, []);

  const handleRefresh = useCallback(async () => {
    if (!userId) return;
    setIsRefreshing(true);
    try {
      await fetchOrdersByDate(userId, selectedDate, { showLoading: false });
      await fetchAllConfig();
    } finally {
      setIsRefreshing(false);
    }
  }, [userId, selectedDate, fetchOrdersByDate]);

  const fetchAllConfig = async () => {
    try {
      const configData = await getAllConfig();
      console.log('==========');
      console.log(configData);
      setSelectedDate(
        configData.timeServe
          ? new Date(configData?.timeServe?.serverDate)
          : new Date(),
      );
      setDateServer(configData?.timeServe?.serverDate);
      dispatch(setAllConfig(configData));
    } catch (error) {
      console.error('Failed to fetch system config:', error);
    }
  };

  useEffect(() => {
    fetchAllConfig();
  }, []);
  console.log(filteredOrders);
  return (
    <MainLayout
      headerTitle="Đơn hàng"
      useScrollView={false}
      headerRightComponent={
        <View className="flex-row items-center bg-gray-100 rounded-xl p-2 shadow-sm">
          <TouchableOpacity
            onPress={() => setShowWeekCalendar(true)}
            className="flex-row items-center px-2"
          >
            <Icon name="calendar" size={18} color="#e85a4f" />
            <Text className="ml-2 text-sm font-semibold text-text-main">
              {formatWeekLabel(selectedDate)}
            </Text>
          </TouchableOpacity>
        </View>
      }
    >
      <WeeklyCalendar
        visible={showWeekCalendar}
        initialDate={selectedDate}
        onClose={() => setShowWeekCalendar(false)}
        onSelect={handleSelectDate}
      />

      <WeekStrip
        selectedDate={selectedDate}
        onSelectDate={handleSelectDate}
        onPrevWeek={() => changeWeek(-1)}
        onNextWeek={() => changeWeek(1)}
      />

      <StatusFilter
        options={statusOptions}
        selectedStatus={selectedStatus}
        onStatusChange={handleStatusChange}
      />

      <View className="flex-1 bg-background-50">
        <FlatList
          className="flex-1"
          data={filteredOrders}
          keyExtractor={(item, index) =>
            String(item.collectionRouteId || index)
          }
          renderItem={({ item }) => (
            <DeliveryOrderCard
              order={item}
              isSelectedDateToday={isSelectedDateToday}
            />
          )}
          contentContainerStyle={
            filteredOrders.length === 0
              ? {
                  paddingHorizontal: 16,
                  paddingTop: 8,
                  flexGrow: 1,
                  justifyContent: 'center',
                }
              : { paddingHorizontal: 16, paddingTop: 8 }
          }
          ListEmptyComponent={
            isLoading ? (
              <View className="items-center justify-center flex-1">
                <ActivityIndicator size="large" color="#e85a4f" />
                <Text className="text-text-muted mt-4 text-center">
                  Đang tải...
                </Text>
              </View>
            ) : (
              <View className="items-center justify-center flex-1">
                <Icon name="package-variant" size={64} color="#DDD" />
                <Text className="text-text-muted mt-4 text-center">
                  Không có đơn hàng nào
                </Text>
              </View>
            )
          }
          refreshing={isRefreshing}
          onRefresh={handleRefresh}
          showsVerticalScrollIndicator={false}
        />
      </View>
    </MainLayout>
  );
}
