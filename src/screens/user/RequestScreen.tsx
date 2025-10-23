import React from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';

const RequestScreen = () => {
  const navigation = useNavigation<any>();

  const requests = [
    {
      id: 1,
      name: 'Tủ lạnh cũ',
      time: '3 phút trước',
      image: require('../../assets/images/avatar.jpg'),
      status: 'Đang xử lý',
      statusColor: 'bg-yellow-400',
    },
    {
      id: 2,
      name: 'Máy giặt cũ',
      time: '3 tháng trước',
      image: require('../../assets/images/avatar.jpg'),
      status: 'Đã hoàn thành',
      statusColor: 'bg-green-500',
    },
  ];

  return (
    <View className="flex-1 bg-white">
      {/* Header */}
      <View className="flex-row items-center justify-between px-4 pt-12 pb-4">
        <TouchableOpacity>
          <Icon name="menu" size={24} color="#000" />
        </TouchableOpacity>
        <TouchableOpacity>
          <Icon name="bell" size={24} color="#000" />
        </TouchableOpacity>
      </View>

      {/* Title Section */}
      <View className="flex-row items-center justify-between px-4 py-4">
        <Text className="text-xl font-bold text-gray-900">Yêu cầu của tôi</Text>
        <TouchableOpacity
          className="flex-row items-center bg-teal-50 px-3 py-2 rounded-lg"
          onPress={() => navigation.navigate('CreateRequest')}
        >
          <Icon name="plus-square" size={18} color="#14b8a6" />
          <Text className="text-secondary-100 font-semibold ml-2">
            Tạo yêu cầu
          </Text>
        </TouchableOpacity>
      </View>

      {/* Request List */}
      <ScrollView className="flex-1 px-4">
        {requests.map(request => (
          <TouchableOpacity
            key={request.id}
            className="flex-row items-center bg-white border border-gray-200 rounded-xl p-3 mb-3 shadow-sm"
          >
            {/* Image */}
            <Image
              source={request.image}
              className="w-16 h-16 rounded-lg"
              resizeMode="cover"
            />

            {/* Content */}
            <View className="flex-1 ml-3">
              <Text className="text-base font-semibold text-gray-900 mb-1">
                {request.name}
              </Text>
              <View className="flex-row items-center">
                <Icon name="clock" size={14} color="#9ca3af" />
                <Text className="text-sm text-gray-500 ml-1">
                  {request.time}
                </Text>
              </View>
            </View>

            {/* Status Badge */}
            <View className={`${request.statusColor} px-3 py-1 rounded-full`}>
              <Text className="text-xs font-medium text-white">
                {request.status}
              </Text>
            </View>
          </TouchableOpacity>
        ))}
      </ScrollView>
    </View>
  );
};

export default RequestScreen;
