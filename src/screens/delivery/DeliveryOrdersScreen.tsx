import React, { useRef, useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SubLayout from '../../layout/SubLayout';
import AppButton from '../../components/ui/AppButton';

// Get current date for default data
const today = new Date();
const tomorrow = new Date(today);
tomorrow.setDate(tomorrow.getDate() + 1);

const allOrders = [
  {
    id: 1,
    product: 'Tủ lạnh',
    time: '16:00 đến 20:00',
    date: today,
    address: '123 Võ Văn Ngân',
    city: 'Thành phố Thủ Đức, Thành phố Hồ Chí Minh',
    status: 'delivering', // delivering, completed, pending
  },
  {
    id: 2,
    product: 'Máy giặt',
    time: '16:00 đến 20:00',
    date: today,
    address: '139 Võ Văn Ngân',
    city: 'Thành phố Thủ Đức, Thành phố Hồ Chí Minh',
    status: 'pending',
  },
  {
    id: 3,
    product: 'Máy lạnh',
    time: '14:00 đến 18:00',
    date: today,
    address: '456 Đường ABC',
    city: 'Quận 9, Thành phố Hồ Chí Minh',
    status: 'completed',
  },
  {
    id: 4,
    product: 'Tivi Samsung',
    time: '09:00 đến 12:00',
    date: tomorrow,
    address: '789 Đường XYZ',
    city: 'Quận 1, Thành phố Hồ Chí Minh',
    status: 'pending',
  },
];

const statusOptions = [
  { value: 'all', label: 'Tất cả', color: '#666' },
  { value: 'pending', label: 'Chờ giao', color: '#FF9800' },
  { value: 'delivering', label: 'Đang giao', color: '#4169E1' },
  { value: 'completed', label: 'Hoàn thành', color: '#4CAF50' },
];

export default function DeliveryOrdersScreen() {
  const navigation = useNavigation<any>();
  const listRef = useRef(null);
  const lastItemRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);
  const [selectedStatus, setSelectedStatus] = useState('all');
  const [selectedDate, setSelectedDate] = useState(new Date());
  const [showDatePicker, setShowDatePicker] = useState(false);

  // Whether the currently selected date is today (used to enable/disable action buttons)
  const isSelectedDateToday =
    selectedDate.toDateString() === new Date().toDateString();

  // Filter orders based on status and date
  const filteredOrders = allOrders.filter(order => {
    const matchesStatus =
      selectedStatus === 'all' || order.status === selectedStatus;
    const matchesDate =
      order.date.toDateString() === selectedDate.toDateString();
    return matchesStatus && matchesDate;
  });

  // Debug: log status changes to help diagnose UI issues
  useEffect(() => {
    console.log('[DeliveryOrders] selectedStatus=', selectedStatus);
    console.log(
      '[DeliveryOrders] filteredOrders.length=',
      filteredOrders.length,
    );
  }, [selectedStatus, filteredOrders.length]);

  useEffect(() => {
    if (filteredOrders.length > 0) {
      // Delay measurement to ensure layout is complete
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

  const getStatusColor = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.color || '#666';
  };

  const getStatusLabel = (status: string) => {
    const statusOption = statusOptions.find(opt => opt.value === status);
    return statusOption?.label || status;
  };

  return (
    <SubLayout title="Đơn hàng" onBackPress={() => navigation.goBack()}>
      <ScrollView className="flex-1">
        {/* Date Picker */}
        <View className="px-4 pt-4 pb-2">
          <View className="flex-row items-center justify-between bg-white rounded-xl p-3 shadow-sm">
            <TouchableOpacity onPress={() => changeDate(-1)} className="p-2">
              <Icon name="chevron-left" size={24} color="#4169E1" />
            </TouchableOpacity>

            <TouchableOpacity
              onPress={() => setShowDatePicker(true)}
              className="flex-row items-center"
            >
              <Icon name="calendar" size={20} color="#4169E1" />
              <Text className="ml-2 text-base font-semibold text-text-main">
                {formatDate(selectedDate)}
              </Text>
            </TouchableOpacity>

            <TouchableOpacity onPress={() => changeDate(1)} className="p-2">
              <Icon name="chevron-right" size={24} color="#4169E1" />
            </TouchableOpacity>
          </View>
        </View>

        {/* Status Tabs */}
        <View className="px-4 py-3">
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
                      fontSize: 14,
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

        {/* Orders List */}
        <View className="px-4 pt-2">
          {filteredOrders.length === 0 ? (
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
                className="absolute left-4 top-5 w-0.5 bg-primary-50 z-0"
                style={{
                  height: lineHeight,
                }}
              />
              <View className="flex-1">
                {filteredOrders.map((order, idx) => (
                  <View
                    key={order.id}
                    className="flex-row mb-8 relative z-10"
                    ref={
                      idx === filteredOrders.length - 1
                        ? lastItemRef
                        : undefined
                    }
                  >
                    {/* Timeline icon */}
                    <View className="items-center mr-3">
                      <View
                        className="w-10 h-10 rounded-full items-center justify-center"
                        style={{
                          backgroundColor: `${getStatusColor(order.status)}20`,
                        }}
                      >
                        <Icon
                          name={
                            order.status === 'completed'
                              ? 'check-circle'
                              : order.status === 'delivering'
                              ? 'truck'
                              : 'clock-outline'
                          }
                          size={24}
                          color={getStatusColor(order.status)}
                        />
                      </View>
                    </View>
                    {/* Order card */}
                    <View className="flex-1">
                      <View className="flex-row justify-between">
                        <View className="flex-col flex-1">
                          <View className="flex-row items-center mb-1">
                            <Text className="text-lg font-bold text-text-main">
                              {order.product}
                            </Text>
                            <View
                              className="ml-2 px-2 py-1 rounded-full"
                              style={{
                                backgroundColor: `${getStatusColor(
                                  order.status,
                                )}20`,
                              }}
                            >
                              <Text
                                className="text-xs font-semibold"
                                style={{ color: getStatusColor(order.status) }}
                              >
                                {getStatusLabel(order.status)}
                              </Text>
                            </View>
                          </View>
                          <Text className="text-xs text-text-muted mb-2">
                            {order.time}
                          </Text>
                        </View>
                        <View className="flex-row gap-3 items-start">
                          <TouchableOpacity
                            onPress={() =>
                              // only navigate when the selected date is today
                              isSelectedDateToday &&
                              navigation.navigate('DeliveryMapOrder')
                            }
                            className="bg-primary-50 rounded-full p-2"
                            disabled={!isSelectedDateToday}
                            style={{ opacity: isSelectedDateToday ? 1 : 0.4 }}
                          >
                            <Icon name="directions" size={18} color="#4169E1" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            className="bg-primary-50 rounded-full p-2"
                            disabled={!isSelectedDateToday}
                            onPress={() => {
                              if (!isSelectedDateToday) return;
                              // TODO: implement call behavior (Linking) or navigate to call flow
                              console.log('call pressed for order', order.id);
                            }}
                            style={{ opacity: isSelectedDateToday ? 1 : 0.4 }}
                          >
                            <Icon name="phone" size={18} color="#4169E1" />
                          </TouchableOpacity>

                          <TouchableOpacity
                            className="bg-primary-50 rounded-full p-2"
                            disabled={!isSelectedDateToday}
                            onPress={() => {
                              if (!isSelectedDateToday) return;
                              // TODO: implement message behavior (chat screen or Linking)
                              console.log(
                                'message pressed for order',
                                order.id,
                              );
                            }}
                            style={{ opacity: isSelectedDateToday ? 1 : 0.4 }}
                          >
                            <Icon
                              name="message-text"
                              size={18}
                              color="#4169E1"
                            />
                          </TouchableOpacity>
                        </View>
                      </View>
                      <View className="bg-primary-50 rounded-xl p-3 mb-2">
                        <View className="flex-row items-center mb-1">
                          <Icon name="map-marker" size={18} color="#4169E1" />
                          <Text className="ml-2 text-base font-semibold text-primary-100">
                            {order.address}
                          </Text>
                        </View>
                        <Text className="text-xs text-text-muted ml-6 mb-4">
                          {order.city}
                        </Text>
                      </View>
                    </View>
                  </View>
                ))}
              </View>
            </View>
          )}
        </View>
      </ScrollView>
    </SubLayout>
  );
}
