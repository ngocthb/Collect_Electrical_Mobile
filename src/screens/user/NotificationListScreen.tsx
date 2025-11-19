import React, { useState, useEffect, useRef } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import MainLayout from '../../layout/MainLayout';
import StatusFilter from '../../components/ui/StatusFilter';
import { useAppSelector } from '../../store/hooks';
import { getProductsByUser } from '../../services/productService';

interface NotificationListScreenProps {
  navigation: any;
}

const NotificationListScreen: React.FC<NotificationListScreenProps> = ({
  navigation,
}) => {
  const [products, setProducts] = useState<any[]>([]);
  const { user } = useAppSelector((s: any) => s.auth);

  const statusGroupMap: Record<string, string[]> = {
    grouping: ['Chờ gom nhóm'],
    collecting: ['Chờ thu gom'],
    cancelled: ['Hủy bỏ'],
    recycle: ['Tái chế', 'Đã đóng gói', 'Đã thu gom', 'Nhập kho'],
  };

  const isMounted = useRef(true);

  const loadProducts = async () => {
    try {
      const userId = user?.userId;
      if (!userId) return;
      const resp = await getProductsByUser(userId);
      if (isMounted.current) setProducts(Array.isArray(resp) ? resp : []);
    } catch (e) {
      console.warn('[Products] Failed to load user products', e);
    }
  };

  useEffect(() => {
    isMounted.current = true;
    loadProducts();
    return () => {
      isMounted.current = false;
    };
  }, [user]);

  const renderProductStatusBadge = (status: string | null | undefined) => {
    if (!status) return null;
    const s = String(status).trim();
    let label = s;
    let bg = '#9ca3af';

    if (s === 'Chờ gom nhóm') {
      label = 'Chờ gom nhóm';
      bg = '#2563EB';
    } else if (s === 'Chờ thu gom') {
      label = 'Chờ thu gom';
      bg = '#f59e0b';
    } else if (s === 'Hủy bỏ') {
      label = 'Hủy bỏ';
      bg = '#ef4444';
    } else if (
      ['Tái chế', 'Đã đóng gói', 'Đã thu gom', 'Nhập kho'].includes(s)
    ) {
      label = 'Tái chế';
      bg = '#16a34a';
    }

    return (
      <View
        style={{
          backgroundColor: bg,
          paddingHorizontal: 8,
          paddingVertical: 4,
          borderRadius: 8,
          alignSelf: 'flex-start',
        }}
      >
        <Text style={{ color: '#fff', fontSize: 10, fontWeight: '600' }}>
          {label}
        </Text>
      </View>
    );
  };

  const [selectedProductGroup, setSelectedProductGroup] = useState<string>('');

  const statusGroupOptions = [
    { value: '', label: 'Tất cả', color: 'gray' },
    { value: 'grouping', label: 'Chờ nhóm', color: 'blue' },
    { value: 'collecting', label: 'Chờ thu gom', color: 'yellow' },
    { value: 'cancelled', label: 'Hủy bỏ', color: 'red' },
    { value: 'recycle', label: 'Tái chế', color: 'green' },
  ];

  return (
    <MainLayout headerTitle="Thông báo" onRefresh={loadProducts}>
      <View className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <View className="mt-3">
          <StatusFilter
            options={statusGroupOptions}
            selectedStatus={selectedProductGroup}
            onStatusChange={setSelectedProductGroup}
          />
        </View>

        <ScrollView
          className="flex-1 mt-2 px-4"
          showsVerticalScrollIndicator={false}
        >
          <View className="mt-4">
            {(() => {
              const filteredProducts = products.filter(p =>
                selectedProductGroup
                  ? statusGroupMap[selectedProductGroup].includes(p.status)
                  : true,
              );

              if (products.length === 0) {
                return (
                  <View className="items-center justify-center py-12">
                    <Icon name="inbox" size={64} color="#DDD" />
                    <Text className="text-text-muted mt-4 text-center">
                      Chưa có sản phẩm
                    </Text>
                  </View>
                );
              }

              if (filteredProducts.length === 0) {
                return (
                  <View className="items-center justify-center py-12">
                    <Icon name="inbox" size={64} color="#DDD" />
                    <Text className="text-text-muted mt-4 text-center">
                      Không có đơn hàng nào
                    </Text>
                  </View>
                );
              }

              return filteredProducts.map(prod => {
                const handlePress = () => {
                  const status = String(prod.status || '').trim();

                  // determine group key based on statusGroupMap
                  let groupKey = '';
                  for (const k of Object.keys(statusGroupMap)) {
                    if (statusGroupMap[k].includes(status)) {
                      groupKey = k;
                      break;
                    }
                  }

                  if (groupKey === 'collecting') {
                    navigation.navigate('Delivering', { notification: prod });
                  } else if (groupKey === 'recycle') {
                    navigation.navigate('UserNotificationDetail', {
                      product: prod,
                    });
                  } else if (groupKey === 'grouping') {
                    navigation.navigate('ShipmentDetail', {
                      notification: prod,
                    });
                  } else if (groupKey === 'cancelled') {
                    navigation.navigate('CancelledProduct', { product: prod });
                  } else {
                    navigation.navigate('ProductDetail', {
                      productId: prod.productId,
                    });
                  }
                };

                return (
                  <TouchableOpacity
                    key={prod.productId}
                    className="flex-row  p-3 mb-3 rounded-lg border border-gray-200 bg-white"
                    onPress={handlePress}
                  >
                    <View className="w-16 h-16 rounded-2xl overflow-hidden bg-gray-100">
                      <Image
                        source={{ uri: prod.productImages?.[0] || '' }}
                        className="w-full h-full"
                        resizeMode="cover"
                      />
                    </View>
                    <View className="flex-1 ml-4">
                      <Text
                        className="font-bold text-base "
                        numberOfLines={1}
                        ellipsizeMode="tail"
                      >
                        {prod.categoryName} • {prod.brandName}
                      </Text>

                      <Text className="text-sm text-gray-700" numberOfLines={2}>
                        {prod.description}
                      </Text>

                      <View className="flex-row items-center mt-1">
                        <Text className="text-xs text-gray-400">
                          {prod.sizeTierName}
                        </Text>
                      </View>
                    </View>
                    <View className="ml-2">
                      {renderProductStatusBadge(prod.status)}
                    </View>
                  </TouchableOpacity>
                );
              });
            })()}
          </View>
        </ScrollView>
      </View>
    </MainLayout>
  );
};

export default NotificationListScreen;
