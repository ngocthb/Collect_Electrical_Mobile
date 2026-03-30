import React, {
  useRef,
  useEffect,
  useState,
  useMemo,
  useCallback,
} from 'react';
import {
  ScrollView,
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
import { getTimeSever } from '../../services/systemServe';
import { ServerTime } from './../../types/common';
import MainLayout from '../../layout/MainLayout';
export default function DeliveryListScreen() {
  const navigation = useNavigation<any>();
  const listRef = useRef(null);
  const lastItemRef = useRef(null);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showWeekCalendar, setShowWeekCalendar] = useState(false);
  const [ordersWithDistance, setOrdersWithDistance] = useState<
    CollectionRouteWithDistance[]
  >([]);
  const [dateSever, setDateServer] = useState<string>();
  const [isLoading, setIsLoading] = useState(false);
  const [serverDate, setServerDate] = useState<ServerTime>();
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
    async (userId: string, date: Date) => {
      setIsLoading(true);
      try {
        const dateStr = formatAPIDate(date);
        const res = await routeService.listByDate(userId, dateStr);
        setDateServer(res.serverDate);
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
        setIsLoading(false);
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

  const handleBackPress = useCallback(() => {
    if (navigation.canGoBack && navigation.canGoBack()) {
      navigation.goBack();
    } else {
      navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
    }
  }, [navigation]);

  const handleSelectDate = useCallback((d: Date) => {
    setIsLoading(true); // 🔥 quan trọng
    setOrdersWithDistance([]); // optional, để clear list
    setSelectedDate(d);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
  }, []);

  const getDateTimeSever = async () => {
    try {
      const serverTime = await getTimeSever();
      setServerDate(serverTime);
      // Set selectedDate theo server date lần đầu
      if (serverTime?.serverDate) {
        setSelectedDate(new Date(serverTime.serverDate));
      }
    } catch (error) {
      console.error('Failed to get server time:', error);
    }
  };

  useEffect(() => {
    getDateTimeSever();
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
        serverDate={serverDate}
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
        {isLoading ? (
          <View className="items-center justify-center flex-1">
            <ActivityIndicator size="large" color="#e85a4f" />
            <Text className="text-text-muted mt-4 text-center">
              Đang tải...
            </Text>
          </View>
        ) : filteredOrders.length === 0 ? (
          <View className="items-center justify-center flex-1">
            <Icon name="package-variant" size={64} color="#DDD" />
            <Text className="text-text-muted mt-4 text-center">
              Không có đơn hàng nào
            </Text>
          </View>
        ) : (
          <ScrollView className="flex-1">
            <View className="px-4 pt-2">
              <View className="flex-row relative" ref={listRef}>
                <View className="flex-1">
                  {filteredOrders.map((order, idx) => {
                    const isLast = idx === filteredOrders.length - 1;
                    return (
                      <View
                        key={order.collectionRouteId || idx}
                        ref={isLast ? lastItemRef : null}
                      >
                        <DeliveryOrderCard
                          order={order}
                          isSelectedDateToday={isSelectedDateToday}
                        />
                      </View>
                    );
                  })}
                </View>
              </View>
            </View>
          </ScrollView>
        )}
      </View>
    </MainLayout>
  );
}
