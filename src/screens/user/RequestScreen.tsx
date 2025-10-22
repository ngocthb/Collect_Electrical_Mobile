import React from 'react';
import { View, Text, Image, TouchableOpacity } from 'react-native';
import MainLayout from '../../layout/MainLayout';
import AppButton from '../../components/ui/AppButton';
import { useNavigation } from '@react-navigation/native';

const request = require('../../assets/images/request.png');

const RequestScreen = () => {
  const navigation = useNavigation<any>();

  return (
    <MainLayout>
      <View className="flex-1 items-center justify-center px-6">
        <Image
          source={request}
          className="w-52 h-52 mb-6"
          resizeMode="contain"
        />
        <Text className="text-xl font-bold text-text-main mb-4">
          Bạn chưa có yêu cầu thu gom
        </Text>
        <Text className="text-center text-text-sub mb-6">
          Bạn chưa có yêu cầu thu gom nào. Tạo yêu cầu thu gom ngay bằng cách
          nhấn vào nút bên dưới.
        </Text>
        <AppButton
          title="Tạo yêu cầu thu gom"
          onPress={() => navigation.navigate('CreateRequest')}
        />
      </View>
    </MainLayout>
  );
};

export default RequestScreen;
