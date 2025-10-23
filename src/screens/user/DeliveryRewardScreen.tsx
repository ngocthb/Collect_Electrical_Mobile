import React from 'react';
import { View, Text, TouchableOpacity, Image } from 'react-native';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/core';
import AppButton from '../../components/ui/AppButton';
const deliveryreward = require('../../assets/images/deliveryreward.png');
const DeliveryRewardScreen = () => {
  const navigation = useNavigation<any>();
  return (
    <SubLayout title="Hoàn tất" onBackPress={() => navigation.goBack()}>
      <View className="flex-1 bg-white items-center justify-center px-6">
        {/* Illustration */}
        <Image
          source={deliveryreward}
          className="w-56 h-56 mb-6"
          resizeMode="contain"
        />
        {/* Title & Reward */}
        <Text className="text-center font-bold text-xl mb-2">Hurray!</Text>
        <Text className="text-center font-bold text-lg mb-4">
          Bạn sẽ nhận được 100 <Text className="text-yellow-500">🪙</Text>
        </Text>
        {/* Description */}
        <Text className="text-center text-gray-500 mb-8">
          Chúng tôi sẽ cập nhật trạng thái yêu cầu nhanh nhất có thể. Bạn vui
          lòng theo dõi tiến trình của yêu cầu.
        </Text>
        {/* Button */}
        <AppButton
          title="Xem trạng thái yêu cầu"
          onPress={() => navigation.navigate('DeliveryInfo')}
        />
      </View>
    </SubLayout>
  );
};

export default DeliveryRewardScreen;
