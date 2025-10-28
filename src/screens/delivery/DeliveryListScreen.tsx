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
import DeliveryOrderCard from '../../components/DeliveryOrderCard';
import {
  getOrderId,
  getOrderDate,
  resolveStatus,
  getOrderName,
  getOrderTime,
  getOrderAddress,
  getStatusColor,
} from '../../utils/deliveryHelpers';
// Badge modal removed in favor of a dedicated cancel screen
import SubLayout from '../../layout/SubLayout';
import { DEFAULT_BADGES } from '../../components/BadgeModal';
import AppButton from '../../components/ui/AppButton';

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
  const [showDatePicker, setShowDatePicker] = useState(false);
  const [orders, setOrders] = useState<any[]>([]);
  const [isLoading, setIsLoading] = useState(false);
  const [badgeModalVisible, setBadgeModalVisible] = useState(false);
  const [activeOrder, setActiveOrder] = useState<any | null>(null);

  // Whether the currently selected date is today (used to enable/disable action buttons)
  const isSelectedDateToday =
    selectedDate.toDateString() === new Date().toDateString();

  // Load orders from API for the selected date
  const formatAPIDate = (date: Date) => {
    const yyyy = date.getFullYear();
    const mm = String(date.getMonth() + 1).padStart(2, '0');
    const dd = String(date.getDate()).padStart(2, '0');
    return `${yyyy}-${mm}-${dd}`;
  };

  const fetchOrdersForDate = async (date: Date) => {
    setIsLoading(true);
    try {
      const dateStr = formatAPIDate(date);
      const res: any = await routeService.listByDate(dateStr);
      setOrders((res || []) as any[]);
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
    fetchOrdersForDate(selectedDate);
    return () => {
      mounted = false;
    };
  }, [selectedDate]);

  // helper functions moved to src/utils/deliveryHelpers.ts

  const reloadOrders = async () => {
    try {
      await fetchOrdersForDate(selectedDate);
    } catch (e) {
      console.warn('Failed to reload orders', e);
    }
  };

  // Filter orders based on status and date (use accessors that support raw/mapped objects)
  const filteredOrders = orders.filter(order => {
    const matchesStatus =
      selectedStatus === 'all' || resolveStatus(order) === selectedStatus;
    const od = getOrderDate(order);
    const matchesDate = od && od.toDateString() === selectedDate.toDateString();
    return matchesStatus && matchesDate;
  });

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

  const formatDate = (date: Date) => {
    const day = date.getDate();
    const month = date.getMonth() + 1;
    const year = date.getFullYear();
    return `${day}/${month}/${year}`;
  };

  const changeDate = (days: number) => {
    const newDate = new Date(selectedDate);
    newDate.setDate(newDate.getDate() + days);
    setSelectedDate(newDate);
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
    >
      {/* Date Picker */}
      <View className="px-4">
        <View className="flex-row items-center justify-between bg-white rounded-xl p-3 shadow-sm">
          <TouchableOpacity onPress={() => changeDate(-1)} className="p-2">
            <Icon name="chevron-left" size={24} color="#4169E1" />
          </TouchableOpacity>

          <TouchableOpacity
            onPress={() => setShowDatePicker(true)}
            className="flex-row items-center"
          >
            <Icon name="calendar" size={20} color="#4169E1" />
            <Text className="ml-2 text-sm font-semibold text-text-main">
              {formatDate(selectedDate)}
            </Text>
          </TouchableOpacity>

          <TouchableOpacity onPress={() => changeDate(1)} className="p-2">
            <Icon name="chevron-right" size={24} color="#4169E1" />
          </TouchableOpacity>
        </View>
      </View>

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
