import React, { useState, useEffect } from 'react';
import { View, Text, Modal, ScrollView, Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import ScanQrComponent from '../../components/ScanQrComponent';
import AppButton from '../../components/ui/AppButton';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/core';
import { useRoute } from '@react-navigation/native';
import mockRequestService from '../../services/mockRequestService';

const avatar = require('../../assets/images/avatar.jpg');

const UserConfirmScreen = () => {
  const [showScanner, setShowScanner] = useState(false);
  const [shipperId, setShipperId] = useState<string | null>(null);
  const [shipperInfo, setShipperInfo] = useState<any | null>(null);
  const route = useRoute<any>();
  const requestId: number | undefined = route.params?.requestId;

  const [request, setRequest] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;
    if (!requestId) return;
    (async () => {
      try {
        const r = await mockRequestService.get(requestId);
        if (mounted) setRequest(r ?? null);
      } catch (e) {
        console.warn('UserConfirm: failed to load request', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [requestId]);
  const navigation = useNavigation<any>();
  return (
    <SubLayout
      title="Xác nhận người giao hàng"
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1 bg-gray-50">
        <View className="flex-1 px-6 pt-12 pb-8">
          {/* Header */}
          <View className="items-center">
            {/* show shipper avatar after successful scan, otherwise show generic user icon */}
            {!shipperId && !shipperInfo && (
              <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center ">
                <Icon name="user" size={40} color="#3B82F6" />
              </View>
            )}

            {(shipperId || shipperInfo) && (
              <Image
                source={
                  shipperInfo && shipperInfo.avatar
                    ? { uri: shipperInfo.avatar }
                    : avatar
                }
                className="w-20 h-20 rounded-full"
                style={{
                  shadowColor: '#3B82F6',
                  shadowOffset: { width: 0, height: 4 },
                  shadowOpacity: 0.3,
                  shadowRadius: 8,
                }}
                resizeMode="cover"
              />
            )}
          </View>

          {/* Status Card */}
          {shipperId ? (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-green-100 mt-10">
              <View className="items-center">
                <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                  <Icon name="check-circle" size={32} color="#10B981" />
                </View>
                <Text className="text-xl font-bold text-green-600 mb-2">
                  Xác nhận thành công!
                </Text>
                <Text className="text-sm text-gray-500 mb-4">
                  Người giao hàng đã được xác thực
                </Text>

                {/* Shipper info (we have no shipper service, show mock details using scanned id) */}
                <View className=" flex-row justify-evenly  bg-gray-50 rounded-xl p-4 w-full mb-4">
                  <View className="items-center mb-4">
                    <Image
                      source={
                        shipperInfo && shipperInfo.avatar
                          ? { uri: shipperInfo.avatar }
                          : avatar
                      }
                      className="w-20 h-20 rounded-full"
                      style={{
                        shadowColor: '#3B82F6',
                        shadowOffset: { width: 0, height: 4 },
                        shadowOpacity: 0.3,
                        shadowRadius: 8,
                      }}
                      resizeMode="cover"
                    />
                  </View>
                  <View>
                    <Text className="text-sm text-start text-gray-600  mb-1">
                      Người giao hàng
                    </Text>
                    <Text className="text-lg font-bold text-gray-900 text-start">
                      {shipperInfo?.name ?? `Shipper ${shipperId}`}
                    </Text>
                    <Text className="text-sm text-gray-500 text-start mt-1">
                      SĐT: {shipperInfo?.phone ?? '0901234567'}
                    </Text>
                  </View>
                </View>

                {/* Items to be delivered (from request) */}
                <View className="bg-white rounded-lg w-full">
                  <Text className="text-sm text-gray-500 mb-2">
                    Danh sách vật phẩm
                  </Text>
                  {request ? (
                    <View>
                      <Text className="text-base font-semibold mb-2">
                        {request.name}
                      </Text>
                      {request.images && request.images.length > 0 && (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          className="mb-2"
                        >
                          {request.images.map((img: any, idx: number) => (
                            <Image
                              key={idx}
                              source={img && img.uri ? { uri: img.uri } : img}
                              style={{
                                width: 80,
                                height: 80,
                                borderRadius: 8,
                                marginRight: 8,
                              }}
                            />
                          ))}
                        </ScrollView>
                      )}
                      <Text className="text-sm text-gray-600">
                        Mô tả: {request.description ?? '—'}
                      </Text>
                    </View>
                  ) : (
                    <Text className="text-sm text-gray-600">
                      Không có thông tin đơn hàng
                    </Text>
                  )}
                </View>
              </View>
            </View>
          ) : (
            <ScanQrComponent
              title=" Xác nhận người giao hàng"
              subtitle=" Quét mã QR của shipper để xác nhận danh tính trước khi nhận hàng"
              instruction="Khách hàng vui lòng xác nhận danh tính của người giao hàng trước khi thực hiện giao dịch"
              onScan={data => {
                // the QR can either be a plain id string or a JSON payload with
                // { shipper: {...}, request: {...} }
                try {
                  const parsed = JSON.parse(String(data));
                  if (parsed && typeof parsed === 'object') {
                    if (parsed.shipper) {
                      setShipperInfo(parsed.shipper);
                      const sid = parsed.shipper.id ?? parsed.shipperId ?? null;
                      if (sid) setShipperId(String(sid));
                    }
                    if (parsed.request) {
                      setRequest(parsed.request);
                    }
                    return;
                  }
                } catch (e) {
                  // not JSON, fall back to id string
                }
                setShipperId(String(data));
              }}
              onClose={() => {}}
            />
          )}

          {/* Scan Button */}
          <AppButton
            title="Về trang chủ"
            onPress={() =>
              navigation.reset({ index: 0, routes: [{ name: 'MainTabs' }] })
            }
            className="mb-4"
          />

          {/* Additional Info */}
          {!shipperId && (
            <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <Text className="text-sm text-amber-800 text-center">
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
