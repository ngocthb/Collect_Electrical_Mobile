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
  getOrderId,
  getOrderDate,
  resolveStatus,
} from '../../utils/deliveryHelpers';
import SubLayout from '../../layout/SubLayout';

const statusOptions = [
  { value: 'all', label: 'Tất cả', color: '#666' },
  { value: 'pending', label: 'Chờ giao', color: '#FF9800' },
  { value: 'failed', label: 'Thất bại', color: '#E53935' },
  { value: 'completed', label: 'Hoàn thành', color: '#4CAF50' },
];

export default function DeliveryListScreen() {
  const navigation = useNavigation<any>();
  const listRef = useRef(null);
  const lastItemRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showWeekCalendar, setShowWeekCalendar] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);

  const isSelectedDateToday = (() => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected.getTime() === today.getTime();
  })();

  const isSelectedDatePast = (() => {
    const selected = new Date(selectedDate);
    selected.setHours(0, 0, 0, 0);
    const today = new Date();
    today.setHours(0, 0, 0, 0);
    return selected.getTime() < today.getTime();
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

  const fetchOrdersForWeek = async (date: Date) => {
    setIsLoading(true);
    try {
      const start = startOfWeek(date);
      const acc: any[] = [];
      for (let i = 0; i < 7; i++) {
        const d = new Date(start);
        d.setDate(start.getDate() + i);
        const dateStr = formatAPIDate(d);
        try {
          const res: any = await routeService.listByDate(dateStr);
          if (res && Array.isArray(res)) acc.push(...res);
        } catch (e) {
          // continue if one day fails
          console.warn('failed loading day', dateStr, (e as any)?.message ?? e);
        }
      }
      setOrders(acc);
    } catch (e: any) {
      console.warn('Failed to load orders from API', e?.message ?? e);
      setOrders([]);
    } finally {
      setIsLoading(false);
    }
  };

  useEffect(() => {
    let mounted = true;
    if (!mounted) return;
    fetchOrdersForWeek(selectedDate);
    return () => {
      mounted = false;
    };
  }, [selectedDate]);

  // Filter orders by status (orders already constrained to selected week)
  let filteredOrders = orders.filter(order => {
    const matchesStatus =
      selectedStatus === 'all' || resolveStatus(order) === selectedStatus;
    return matchesStatus;
  });

  // If viewing "all", move completed and failed orders to the bottom while preserving relative order
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

  // Debug: log status changes to help diagnose UI issues
  useEffect(() => {}, [selectedStatus, filteredOrders.length]);

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
            <Icon name="calendar" size={18} color="#4169E1" />
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

      {/* Inline week selector under header */}
      <WeekStrip
        selectedDate={selectedDate}
        onSelectDate={d => setSelectedDate(d)}
        onPrevWeek={() => changeWeek(-1)}
        onNextWeek={() => changeWeek(1)}
      />

      {/* Status Tabs */}
      <View className="px-4 py-1">
        <View
          style={{
            flexDirection: 'row',
            backgroundColor: '#F3F4F6',
            borderRadius: 12,
            padding: 4,
          }}
        >
          {statusOptions.map(status => {
            const selected = selectedStatus === status.value;
            return (
              <TouchableOpacity
                key={status.value}
                onPress={() => setSelectedStatus(status.value)}
                style={{
                  flex: 1,
                  paddingVertical: 12,
                  borderRadius: 10,
                  backgroundColor: selected ? '#FFFFFF' : 'transparent',
                  alignItems: 'center',
                  justifyContent: 'center',
                  shadowColor: selected ? '#000' : undefined,
                  shadowOpacity: selected ? 0.05 : 0,
                  shadowOffset: { width: 0, height: selected ? 2 : 0 },
                  shadowRadius: selected ? 4 : 0,
                }}
              >
                <Text
                  style={{
                    fontSize: 11,
                    fontWeight: '700',
                    textAlign: 'center',
                    color: selected ? '#3B82F6' : '#9CA3AF',
                  }}
                >
                  {status.label}
                </Text>
              </TouchableOpacity>
            );
          })}
        </View>
      </View>
      <ScrollView className="flex-1">
        {/* Orders List */}
        <View className="px-4 pt-2">
          {isLoading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#4169E1" />
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
                    key={getOrderId(order)}
                    order={order}
                    idx={idx}
                    isLast={idx === filteredOrders.length - 1}
                    isSelectedDateToday={isSelectedDateToday}
                    onOpenMap={() =>
                      isSelectedDateToday &&
                      navigation.navigate('DeliveryMapOrder', {
                        request: order,
                      })
                    }
                    onReject={o => {
                      navigation.navigate('DeliveryCancel', { request: o });
                    }}
                    onConfirm={o =>
                      isSelectedDateToday &&
                      navigation.navigate('DeliveryConfirm', {
                        requestId: getOrderId(o),
                      })
                    }
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
