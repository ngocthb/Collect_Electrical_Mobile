import React, { useRef, useEffect, useState } from 'react';
import { ScrollView, View, Text, TouchableOpacity } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
import SubLayout from '../../layout/SubLayout';
import AppButton from '../../components/ui/AppButton';
const orders = [
  {
    id: 1,
    product: 'Tủ lạnh',
    time: '17 tháng 10, 16:00 đến 20:00',
    address: '123 Võ Văn Ngân',
    city: 'Thành phố Thủ Đức, Thành phố Hồ Chí Minh',
  },
  {
    id: 2,
    product: 'Máy giặt',
    time: '17 tháng 10, 16:00 đến 20:00',
    address: '139 Võ Văn Ngân',
    city: 'Thành phố Thủ Đức, Thành phố Hồ Chí Minh',
  },
];

export default function DeliveryOrdersScreen() {
  const navigation = useNavigation<any>();
  const listRef = useRef(null);
  const lastItemRef = useRef(null);
  const [lineHeight, setLineHeight] = useState(0);

  useEffect(() => {
    if (listRef.current && lastItemRef.current) {
      // @ts-ignore
      listRef.current.measure((x, y, w, h) => {
        // @ts-ignore
        lastItemRef.current.measure((lx, ly, lw, lh) => {
          setLineHeight(h - lh - 15);
        });
      });
    }
  }, []);

  return (
    <SubLayout title="Đơn hàng" onBackPress={() => navigation.goBack()}>
      <ScrollView className="px-4 pt-2">
        <View className="flex-row relative" ref={listRef}>
          {/* Timeline vertical line */}
          <View
            className="absolute left-4 top-5 w-0.5 bg-primary-50 z-0"
            style={{
              height: lineHeight,
            }}
          />
          <View className="flex-1">
            {orders.map((order, idx) => (
              <View
                key={order.id}
                className="flex-row mb-8 relative z-10"
                ref={idx === orders.length - 1 ? lastItemRef : undefined}
              >
                {/* Timeline icon */}
                <View className="items-center mr-3">
                  <View className="w-10 h-10 rounded-full bg-primary-50 items-center justify-center">
                    <Icon name="truck" size={24} color="#4169E1" />
                  </View>
                </View>
                {/* Order card */}
                <View className="flex-1">
                  <View className="flex-row justify-between">
                    <View className="flex-col">
                      <Text className="text-lg font-bold mb-1 text-text-main">
                        {order.product}
                      </Text>
                      <Text className="text-xs text-text-muted mb-2">
                        {order.time}
                      </Text>
                    </View>
                    <View className="flex-row gap-3 items-center">
                      <TouchableOpacity className="bg-primary-50 rounded-full p-2">
                        <Icon name="phone" size={18} color="#4169E1" />
                      </TouchableOpacity>
                      <TouchableOpacity className="bg-primary-50 rounded-full p-2">
                        <Icon name="message-text" size={18} color="#4169E1" />
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
                    <AppButton
                      title="Xem chi tiết đơn hàng"
                      size="small"
                      onPress={() => navigation.navigate('DeliveryMapOrder')}
                    />
                  </View>
                </View>
              </View>
            ))}
          </View>
        </View>
      </ScrollView>
    </SubLayout>
  );
}
