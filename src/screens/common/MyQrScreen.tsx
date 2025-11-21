import React from 'react';
import { View, Text } from 'react-native';
import MainLayout from '../../layout/MainLayout';
import { useAppSelector } from '../../store/hooks';
import QRCode from 'react-native-qrcode-svg';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/native';
export default function MyQrScreen() {
  const { user } = useAppSelector(s => s.auth);
  const phone = user?.phone;
  const navigation = useNavigation<any>();
  return (
    <SubLayout title="Mã QR của tôi" onBackPress={() => navigation.goBack()}>
      <View className="flex-1 items-center justify-center px-6">
        <View className="bg-white p-6 rounded-lg items-center">
          <QRCode value={String(phone)} size={200} />
          <Text className="mt-4 text-sm text-gray-700">Mã QR của bạn</Text>
          <Text className="mt-1 text-xs text-gray-500">{String(phone)}</Text>
        </View>
      </View>
    </SubLayout>
  );
}
