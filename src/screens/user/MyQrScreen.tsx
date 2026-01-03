import React from 'react';
import { View, Text, Dimensions } from 'react-native';

import { useAppSelector } from '../../store/hooks';
import QRCode from 'react-native-qrcode-svg';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/native';
const { width, height } = Dimensions.get('window');
export default function MyQrScreen() {
  const { user } = useAppSelector(s => s.auth);
  const phone = user?.phone;
  const navigation = useNavigation<any>();
  return (
    <SubLayout title="Mã QR của tôi" onBackPress={() => navigation.goBack()}>
      <View className="flex-1 bg-background-50 items-center justify-center px-6">
        <View className="bg-white p-6 rounded-lg items-center border-2 border-red-200">
          <QRCode value={String(phone)} size={(300 * height) / 812} />
          <Text className="mt-4 text-sm text-gray-700">Mã QR của bạn</Text>
          <Text className="mt-1 text-xs text-gray-500">{String(phone)}</Text>
        </View>
      </View>
    </SubLayout>
  );
}
