import React, { useRef, useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, Animated } from 'react-native';
import { useNavigation } from '@react-navigation/native';
import Icon from 'react-native-vector-icons/Feather';
import SubLayout from '../../layout/SubLayout';
const delivering1 = require('../../assets/images/delivering1.png');
const delivering2 = require('../../assets/images/delivering2.png');
export default function DeliveringScreen() {
  const navigation = useNavigation<any>();

  const shipper = {
    name: 'Trần Văn B',
    phone: '+84987654321',
    vehicle: 'Xe máy - Sirius',
    avatar: require('../../assets/images/avatar.jpg'),
  };

  const START_ETA_MIN = 12;
  const START_DISTANCE_KM = 3.2;

  const [remainingEtaText, setRemainingEtaText] = useState(
    `≈ ${START_ETA_MIN} phút`,
  );
  const [remainingDistanceText, setRemainingDistanceText] = useState(
    `${START_DISTANCE_KM.toFixed(1)} km`,
  );

  const progress = useRef(new Animated.Value(0)).current;

  useEffect(() => {
    const DURATION_MS = 5000;
    const listenerId = progress.addListener(({ value }) => {
      const remainingFraction = Math.max(0, 1 - value);
      const remainingKm = START_DISTANCE_KM * remainingFraction;
      const remainingMinutes = START_ETA_MIN * remainingFraction;
      const distanceText = `${Math.max(0, remainingKm).toFixed(1)} km`;
      let etaText = '';
      if (remainingMinutes >= 1) {
        etaText = `≈ ${Math.ceil(remainingMinutes)} phút`;
      } else {
        const seconds = Math.ceil(remainingMinutes * 60);
        etaText = `${seconds} giây`;
      }

      setRemainingDistanceText(distanceText);
      setRemainingEtaText(etaText);
    });

    const anim = Animated.loop(
      Animated.sequence([
        Animated.timing(progress, {
          toValue: 1,
          duration: DURATION_MS,
          useNativeDriver: false,
        }),
        Animated.timing(progress, {
          toValue: 0,
          duration: 0,
          useNativeDriver: false,
        }),
      ]),
    );
    anim.start();

    return () => {
      anim.stop();
      progress.removeListener(listenerId);
    };
  }, [progress]);

  // interpolate to px for a route bar width
  const BAR_WIDTH = 300;
  const AVATAR_SIZE = 36;
  const fillWidth = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BAR_WIDTH],
  });
  const avatarLeft = progress.interpolate({
    inputRange: [0, 1],
    outputRange: [0, BAR_WIDTH - AVATAR_SIZE],
  });

  const handleCall = () => {
    // simple navigation to DeliveryInfo or call action could be wired here
    navigation.goBack();
  };

  return (
    <SubLayout title="Đang giao" onBackPress={() => navigation.goBack()}>
      <View className="flex-1 p-4 bg-white items-center">
        <View className="w-full items-center mt-6">
          <Text className="text-gray-500">Ước tính còn lại</Text>
          <Text className="text-2xl font-bold text-gray-900 mt-1">
            {remainingEtaText} · {remainingDistanceText}
          </Text>
        </View>

        <Image source={delivering2} className="w-full h-20" />
        <View className="w-full items-center mt-6">
          <View style={{ width: BAR_WIDTH, height: AVATAR_SIZE * 1.6 }}>
            <View
              style={{
                position: 'absolute',
                left: 0,
                right: 0,
                top: AVATAR_SIZE * 0.8 - 4,
                height: 8,
                borderRadius: 8,
                backgroundColor: '#e5e7eb',
              }}
            />

            <Animated.View
              style={{
                position: 'absolute',
                left: 0,
                top: AVATAR_SIZE / 2 - 4,
                height: 8,
                borderRadius: 8,
                backgroundColor: '#34d399',
                width: fillWidth,
              }}
            />

            <Animated.Image
              source={delivering1}
              style={{
                position: 'absolute',
                top: AVATAR_SIZE * 0.6,
                left: avatarLeft,
                width: AVATAR_SIZE + 8,
                height: AVATAR_SIZE + 8,
                resizeMode: 'contain',
              }}
            />
          </View>

          <View
            style={{ width: BAR_WIDTH }}
            className="flex-row justify-between mt-2 px-1"
          >
            <Text className="text-xs text-gray-400">Bắt đầu</Text>
            <Text className="text-xs text-gray-400">Bạn</Text>
          </View>
        </View>

        {/* Shipper info card at bottom */}
        <View className="mt-8 w-full px-2">
          <View className="bg-white rounded-xl border border-gray-100 p-4 shadow-sm">
            <View className="flex-row items-center">
              <Image
                source={shipper.avatar}
                className="w-16 h-16 rounded-full mr-3"
              />
              <View className="flex-1">
                <Text className="font-bold text-lg">{shipper.name}</Text>
                <Text className="text-sm text-gray-500">{shipper.vehicle}</Text>
                <Text className="text-sm text-gray-400 mt-1">
                  {remainingEtaText} • {remainingDistanceText}
                </Text>
              </View>
              <TouchableOpacity
                onPress={handleCall}
                className="p-2 bg-green-50 rounded-lg"
              >
                <Icon name="phone" size={18} color="#059669" />
              </TouchableOpacity>
            </View>
            <View className="mt-3">
              <TouchableOpacity
                onPress={() => navigation.navigate('DeliveryInfo')}
                className="py-3 rounded-xl bg-green-600 items-center"
              >
                <Text className="text-white font-semibold">
                  Xem chi tiết đơn hàng
                </Text>
              </TouchableOpacity>
            </View>
          </View>
        </View>
      </View>
    </SubLayout>
  );
}
