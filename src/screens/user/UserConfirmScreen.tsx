import React, { useState } from 'react';
import { View, Text, ScrollView, Image, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import ScanQrComponent from '../../components/ScanQrComponent';
import AppButton from '../../components/ui/AppButton';
import AppAvatar from '../../components/ui/AppAvatar';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/core';
import { useRoute } from '@react-navigation/native';
import routeService from '../../services/routeService';

const UserConfirmScreen = () => {
  const [shipperId, setShipperId] = useState<string | null>(null);
  const [shipperInfo, setShipperInfo] = useState<any | null>(null);
  const route = useRoute<any>();
  const [code, setCode] = useState<string | null>(null);
  const initialRequest = route.params?.request ?? null;
  const navigation = useNavigation<any>();
  const [request, setRequest] = useState<any | null>(initialRequest);

  // Handle QR scan
  const handleQRScan = (data: string) => {
    try {
      const parsed = JSON.parse(String(data));

      if (parsed && typeof parsed === 'object') {
        const sid = parsed.code || parsed.shipper?.id || parsed.shipperId;

        if (parsed.code) {
          setCode(parsed.code);
        }
        if (parsed.shipper) {
          setShipperInfo(parsed.shipper);
        }

        if (parsed.request) {
          setRequest(parsed.request);
        }

        if (sid) {
          setShipperId(String(sid));
        } else {
          console.warn('⚠️ No shipper ID found in QR data');
        }

        return;
      }
    } catch (e) {
      console.log('❌ Parse failed, treating as plain ID:', e);
    }

    // Fallback: treat as plain shipper ID string
    setShipperId(String(data));
  };

  const handleGoHome = async () => {
    if (code) {
      await routeService.userConfirmRouter(code, true);
    }
    Alert.alert('Xác nhận', 'Bạn đã xác nhận người giao hàng thành công!');
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SubLayout
      title="Xác nhận người giao hàng"
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1 bg-gray-50">
        <View className="flex-1 px-6 pt-12 pb-8">
          {/* Header Icon - Only show when not scanned */}
          {!shipperId && !shipperInfo && (
            <View className="items-center mb-6">
              <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center">
                <Icon name="user" size={40} color="#3B82F6" />
              </View>
            </View>
          )}

          {/* Success Card - Show after scanning */}
          {shipperId ? (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-green-100">
              <View className="items-center">
                {/* Success Icon */}
                <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                  <Icon name="check-circle" size={32} color="#10B981" />
                </View>

                <Text className="text-xl font-bold text-green-600 mb-2">
                  Xác nhận thành công!
                </Text>
                <Text className="text-sm text-gray-500 mb-6">
                  Người giao hàng đã được xác thực
                </Text>

                {/* Shipper Info Card */}
                <View className="flex-row bg-gray-50 rounded-xl p-4 w-full mb-6">
                  <View className="items-center mr-4">
                    {shipperInfo?.avatar &&
                    typeof shipperInfo.avatar === 'string' ? (
                      <Image
                        source={{ uri: shipperInfo.avatar }}
                        className="w-20 h-20 rounded-full"
                        style={{
                          shadowColor: '#3B82F6',
                          shadowOffset: { width: 0, height: 4 },
                          shadowOpacity: 0.3,
                          shadowRadius: 8,
                        }}
                        resizeMode="cover"
                      />
                    ) : (
                      <AppAvatar name={shipperInfo?.name} size={70} />
                    )}
                  </View>

                  <View className="flex-1 justify-center">
                    <Text className="text-sm text-gray-600 mb-1">
                      Người giao hàng
                    </Text>
                    <Text className="text-base font-bold text-gray-900 mb-1">
                      {shipperInfo?.name || `Shipper ${shipperId}`}
                    </Text>
                    <Text className="text-sm text-gray-600 mb-1">
                      Biển số xe : {shipperInfo?.licensePlate}
                    </Text>
                  </View>
                </View>

                {/* Request/Product Info */}
                <View className="bg-white rounded-lg w-full border border-gray-100 p-4">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-500 font-semibold mb-3">
                      Thông tin đơn hàng
                    </Text>
                    {request && (
                      <Text className="text-sm text-gray-500 font-normal mb-3">
                        {request?.estimatedTime}
                      </Text>
                    )}
                  </View>

                  {request ? (
                    <View>
                      <Text className="text-sm font-semibold text-gray-900 mb-2">
                        {request.itemName}
                      </Text>

                      {/* Product Images */}
                      {request.pickUpItemImages &&
                        request.pickUpItemImages.length > 0 && (
                          <ScrollView
                            horizontal
                            showsHorizontalScrollIndicator={false}
                            className="mb-3"
                          >
                            {request.pickUpItemImages.map(
                              (img: any, idx: number) => (
                                <Image
                                  key={idx}
                                  source={
                                    typeof img === 'string' ? { uri: img } : img
                                  }
                                  style={{
                                    width: 80,
                                    height: 80,
                                    borderRadius: 8,
                                    marginRight: 8,
                                  }}
                                  resizeMode="cover"
                                />
                              ),
                            )}
                          </ScrollView>
                        )}

                      {/* Description */}
                      {request.description && (
                        <Text className="text-sm text-gray-600 mb-2">
                          Mô tả: {request.description}
                        </Text>
                      )}

                      {/* Address */}
                      {request.address && (
                        <View className="flex-row items-start mt-2 bg-gray-50 p-3 rounded-lg">
                          <Icon
                            name="map-pin"
                            size={16}
                            color="#6B7280"
                            style={{ marginTop: 2, marginRight: 8 }}
                          />
                          <Text className="flex-1 text-sm text-gray-700">
                            {request.address}
                          </Text>
                        </View>
                      )}
                    </View>
                  ) : (
                    <Text className="text-sm text-gray-500 text-center py-4">
                      Không có thông tin đơn hàng
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ) : (
            /* QR Scanner - Show when not scanned yet */
            <ScanQrComponent
              title="Xác nhận người giao hàng"
              subtitle="Quét mã QR của shipper để xác nhận danh tính"
              instruction="Khách hàng vui lòng xác nhận danh tính của người giao hàng trước khi thực hiện giao dịch"
              onScan={handleQRScan}
              onClose={() => {}}
            />
          )}

          {/* Bottom Button */}
          <AppButton
            title={
              shipperId ? 'Hoàn thành & Về trang chủ' : 'Hủy & Về trang chủ'
            }
            onPress={handleGoHome}
            className="mb-4"
          />

          {/* Warning Message - Only show when not scanned */}
          {!shipperId && (
            <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <Text className="text-xs text-amber-800 text-center">
                ⚠️ Vui lòng chỉ nhận hàng sau khi đã xác nhận đúng người giao
                hàng
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SubLayout>
  );
};

export default UserConfirmScreen;
