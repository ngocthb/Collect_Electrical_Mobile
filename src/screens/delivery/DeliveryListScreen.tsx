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
import SubLayout from '../../layout/SubLayout';
import StatusFilter from '../../components/ui/StatusFilter';
import { useAppSelector } from '../../store/hooks';
import {
  getCurrentLocation,
  calculateDistance,
} from '../../services/mapboxService';

export default function DeliveryListScreen() {
  const navigation = useNavigation<any>();
  const listRef = useRef(null);
  const lastItemRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showWeekCalendar, setShowWeekCalendar] = useState(false);
  const [ordersWithDistance, setOrdersWithDistance] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const user = useAppSelector(s => s.auth.user);
  const userId = user?.userId;

  // Memoize isSelectedDateToday để tránh tính lại mỗi lần render
  const isSelectedDateToday = useMemo(() => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected.getTime() === today.getTime();
  }, [selectedDate]);

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

  // Tách riêng việc tính distance - chạy ngầm không block UI
  const calculateDistancesInBackground = useCallback(async (orders: any[]) => {
    try {
      const loc = await getCurrentLocation();
      const [currLng, currLat] = loc || [106, 10];

      if (!currLat || !currLng) {
        return orders.map(o => ({ ...o, distanceMeters: 0, distanceText: '' }));
      }

      const mapped = orders.map(o => {
        const lat = o?.lat ?? o?.iat ?? null;
        const lng = o?.lng ?? o?.ing ?? null;

        if (!lat || !lng) {
          return { ...o, distanceMeters: 0, distanceText: '' };
        }

        const dist = calculateDistance(currLat, currLng, lat, lng);
        const distanceText =
          dist < 1000
            ? `${Math.round(dist)} m`
            : `${(dist / 1000).toFixed(1)} km`;

        return { ...o, distanceMeters: dist, distanceText };
      });

      return mapped;
    } catch (locError) {
      console.warn('Failed to compute distances', locError);
      return orders.map(o => ({ ...o, distanceMeters: 0, distanceText: '' }));
    }
  }, []);

  const fetchOrdersForToday = useCallback(
    async (userId: string) => {
      setIsLoading(true);
      try {
        const today = new Date();
        const dateStr = formatAPIDate(today);

        const res: any = await routeService.listByDate(userId, dateStr);
        const orders = Array.isArray(res) ? res : [];

        // Set orders NGAY LẬP TỨC không có distance (hiển thị nhanh)
        const ordersWithoutDistance = orders.map(o => ({
          ...o,
          distanceMeters: 0,
          distanceText: '',
        }));
        setOrdersWithDistance(ordersWithoutDistance);
        setIsLoading(false);

        // Tính distance chạy ngầm KHÔNG block UI
        calculateDistancesInBackground(orders).then(ordersWithDist => {
          setOrdersWithDistance(ordersWithDist);
        });
      } catch (e: any) {
        console.warn('Failed to load orders from API', e?.message ?? e);
        setOrdersWithDistance([]);
        setIsLoading(false);
      }
    },
    [formatAPIDate, calculateDistancesInBackground],
  );

  useEffect(() => {
    if (userId) {
      fetchOrdersForToday(userId);
    }
  }, [userId, fetchOrdersForToday]);

  // Tối ưu: Dùng useMemo để cache kết quả filter và sort
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

  // Tối ưu: Dùng onLayout thay vì measure + setTimeout
  const handleListLayout = useCallback(() => {
    if (filteredOrders.length > 0 && listRef.current && lastItemRef.current) {
      // @ts-ignore
      listRef.current.measure((x, y, w, h) => {
        // @ts-ignore
        lastItemRef.current.measure((lx, ly, lw, lh) => {
          const newHeight = h - lh - 15;
          setLineHeight(newHeight);
        });
      });
    } else {
      setLineHeight(0);
    }
  }, [filteredOrders.length]);

  useEffect(() => {
    // Delay nhỏ để đảm bảo layout đã render xong
    const timer = setTimeout(handleListLayout, 50);
    return () => clearTimeout(timer);
  }, [handleListLayout]);

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
    setSelectedDate(d);
  }, []);

  const handleStatusChange = useCallback((status: string) => {
    setSelectedStatus(status);
  }, []);

  return (
    <SubLayout
      title="Đơn hàng"
      onBackPress={handleBackPress}
      rightComponent={
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

      <ScrollView className="flex-1 bg-background-50">
        <View className="px-4 pt-2">
          {isLoading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#e85a4f" />
              <Text className="text-text-muted mt-4 text-center">
                Đang tải...
              </Text>
            </View>
          ) : filteredOrders.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Icon name="package-variant" size={64} color="#DDD" />
              <Text className="text-text-muted mt-4 text-center">
                Không có đơn hàng nào
              </Text>
            </View>
          ) : (
            <View
              className="flex-row relative"
              ref={listRef}
              onLayout={handleListLayout}
            >
              <View className="flex-1">
                {filteredOrders.map((order, idx) => {
                  const isLast = idx === filteredOrders.length - 1;
                  return (
                    <View
                      key={order.id || idx}
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
          )}
        </View>
      </ScrollView>
    </SubLayout>
  );
}
