import React, { useState } from 'react';
import { View, Text, Modal, ScrollView, Image } from 'react-native';

import Icon from 'react-native-vector-icons/Feather';
import ScanQrComponent from '../../components/ScanQrComponent';
import AppButton from '../../components/ui/AppButton';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/core';
const avatar = require('../../assets/images/avatar.jpg');
const request = {
  id: 1,
  name: 'Tủ lạnh cũ',
  category: 'Gia dụng',
  description: 'Không lạnh, kêu to',
  time: '3 phút trước',
  address: 'Hẻm 123, Phường A, Quận B',
  images: [require('../../assets/images/avatar.jpg')],
  image: require('../../assets/images/avatar.jpg'),
  status: 'Đang chờ duyệt',
};
const DeliveryScanQrScreen = () => {
  const [shipperId, setShipperId] = useState<string | null>(null);
  const navigation = useNavigation<any>();
  return (
    <SubLayout
      title="Xác thực sản phẩm"
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1 bg-gray-50">
        <View className="flex-1 px-6 pt-12 pb-8">
          {/* Header */}
          {!shipperId && (
            <View className="items-center">
              <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center ">
                <Icon name="box" size={40} color="#3B82F6" />
              </View>
            </View>
          )}

          {/* Status Card */}
          {shipperId ? (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-green-100 mt-10">
              <View className="items-center">
                <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                  <Icon name="check-circle" size={32} color="#10B981" />
                </View>
                <Text className="text-xl font-bold text-green-600 mb-2">
                  Xác thực thành công!
                </Text>
                <Text className="text-sm text-gray-500 mb-4">
                  Sản phẩm đã được hệ thống ghi nhận
                </Text>
                <View className=" flex-row justify-evenly  bg-gray-50 rounded-xl p-4 w-full mb-4">
                  <View className="items-center mb-4">
                    <Image
                      source={avatar}
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
                      Người gửi hàng
                    </Text>
                    <Text className="text-lg font-bold text-gray-900 text-start">{`Shipper ${shipperId}`}</Text>
                    <Text className="text-sm text-gray-500 text-start mt-1">
                      SĐT: 090123xxx
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
              title=" Xác thực sản phẩm"
              subtitle="Quét mã QR đã dán trên sản phẩm để xác thực"
              instruction="Nhân viên vui lòng quét mã QR trên sản phẩm để xác thực trước khi chuyển hàng về kho"
              onScan={id => setShipperId(id)}
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

export default DeliveryScanQrScreen;
