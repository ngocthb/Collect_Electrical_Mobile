import React, { useRef, useEffect, useState } from 'react';
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
  const isSelectedDateToday = (() => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected.getTime() === today.getTime();
  })();

  const formatAPIDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const startOfWeek = (d: Date) => {
    const date = new Date(d);
    const day = date.getDay();
    const diff = (day === 0 ? -6 : 1) - day; // Monday as start
    date.setDate(date.getDate() + diff);
    date.setHours(0, 0, 0, 0);
    return date;
  };

  const fetchOrdersForToday = async (userId: string) => {
    setIsLoading(true);
    try {
      const today = new Date();
      const dateStr = formatAPIDate(today);

      const res: any = await routeService.listByDate(userId, dateStr);
      const orders = Array.isArray(res) ? res : [];

      try {
        const loc = await getCurrentLocation();
        const [currLng, currLat] = loc || [106, 10];

        const mapped = orders.map(o => {
          const lat = o?.lat ?? o?.iat ?? null;
          const lng = o?.lng ?? o?.ing ?? null;
          if (!lat || !lng || !currLat || !currLng) {
            return { ...o, distanceMeters: 0, distanceText: '' };
          }
          const dist = calculateDistance(currLat, currLng, lat, lng);
          const distanceText =
            dist < 1000
              ? `${Math.round(dist)} m`
              : `${(dist / 1000).toFixed(1)} km`;
          return { ...o, distanceMeters: dist, distanceText };
        });

        setOrdersWithDistance(mapped);
      } catch (locError) {
        console.warn('Failed to compute distances', locError);
        setOrdersWithDistance(
          orders.map(o => ({ ...o, distanceMeters: 0, distanceText: '' })),
        );
      }
    } catch (e: any) {
      console.warn('Failed to load orders from API', e?.message ?? e);
      setOrdersWithDistance([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    if (userId) {
      fetchOrdersForToday(userId);
    }
  }, [userId]);

  // Filter orders by selected date and status (show only orders of the selected day)
  const selectedStart = new Date(selectedDate);
  selectedStart.setHours(0, 0, 0, 0);
  let filteredOrders = ordersWithDistance.filter(order => {
    const orderDate = getOrderDate(order);
    if (!orderDate) return false;
    const d = new Date(orderDate);
    d.setHours(0, 0, 0, 0);
    const matchesDate = d.getTime() === selectedStart.getTime();
    const matchesStatus =
      selectedStatus === 'all' || resolveStatus(order) === selectedStatus;
    return matchesDate && matchesStatus;
  });

  if (selectedStatus === 'all') {
    const top: any[] = [];
    const middle: any[] = [];
    const bottom: any[] = [];
    filteredOrders.forEach(o => {
      const s = resolveStatus(o);
      if (s === 'completed' || s === 'failed') bottom.push(o);
      else if (s === 'pending') top.push(o);
      else middle.push(o);
    });
    filteredOrders = [...top, ...middle, ...bottom];
  }

  useEffect(() => {
    if (filteredOrders.length > 0) {
      setTimeout(() => {
        if (listRef.current && lastItemRef.current) {
          // @ts-ignore
          listRef.current.measure((x, y, w, h) => {
            // @ts-ignore
            lastItemRef.current.measure((lx, ly, lw, lh) => {
              setLineHeight(h - lh - 15);
            });
          });
        }
      }, 100);
    } else {
      setLineHeight(0);
    }
  }, [filteredOrders]);

  const changeWeek = (weeks: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + weeks * 7);
    setSelectedDate(newDate);
  };

  const formatWeekLabel = (date: Date) => {
    const s = startOfWeek(date);
    const e = new Date(s);
    e.setDate(s.getDate() + 6);
    const pad = (n: number) => String(n).padStart(2, '0');
    return `${pad(s.getDate())}/${pad(s.getMonth() + 1)} - ${pad(
      e.getDate(),
    )}/${pad(e.getMonth() + 1)}`;
  };

  return (
    <SubLayout
      title="Đơn hàng"
      onBackPress={() => {
        if (navigation.canGoBack && navigation.canGoBack()) {
          navigation.goBack();
        } else {
          navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] });
        }
      }}
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
        onSelect={d => setSelectedDate(d)}
      />

      <WeekStrip
        selectedDate={selectedDate}
        onSelectDate={d => setSelectedDate(d)}
        onPrevWeek={() => changeWeek(-1)}
        onNextWeek={() => changeWeek(1)}
      />

      <StatusFilter
        options={statusOptions}
        selectedStatus={selectedStatus}
        onStatusChange={setSelectedStatus}
      />

      <ScrollView className="flex-1 bg-background-50">
        {/* Orders List */}
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
            <View className="flex-row relative" ref={listRef}>
              {/* Timeline vertical line */}
              <View
                className="absolute left-5 top-5 w-0.5 bg-primary-50 z-0"
                style={{
                  height: lineHeight,
                }}
              />
              <View className="flex-1">
                {filteredOrders.map((order, idx) => (
                  <DeliveryOrderCard
                    key={idx}
                    order={order}
                    isSelectedDateToday={isSelectedDateToday}
                  />
                ))}
              </View>
            </View>
          )}
        </View>
        {/* Cancel flow moved to a dedicated screen (DeliveryCancel) */}
      </ScrollView>
    </SubLayout>
  );
}
