import React, { useEffect, useState } from 'react';
import { View, Text, Image, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import mockRequestService from '../../services/mockRequestService';

const RequestScreen = () => {
  const navigation = useNavigation<any>();
  const [requests, setRequests] = useState<any[]>([]);

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      const list = await mockRequestService.list();
      if (mounted) setRequests(list);
    };
    load();
    return () => {
      mounted = false;
    };
  }, []);

  const statusColorClass = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'đang chờ duyệt':
        return 'bg-yellow-400';
      case 'đã duyệt':
        return 'bg-blue-500';
      case 'đã hoàn thành':
        return 'bg-green-500';
      default:
        return 'bg-gray-400';
    }
  };

  const openRequest = (request: any) => {
    const status = (request.status || '').toLowerCase();
    if (status === 'đã hoàn thành') {
      // completed -> show notification/detail screen
      navigation.navigate('UserNotificationDetail', { requestId: request.id });
    } else {
      // pending/other -> show delivery info
      navigation.navigate('DeliveryInfo', { requestId: request.id });
    }
  };

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
            onPress={() => openRequest(request)}
          >
            {/* Image */}
            {request.image ? (
              <Image
                source={request.image}
                className="w-16 h-16 rounded-lg"
                resizeMode="cover"
              />
            ) : (
              <View className="w-16 h-16 rounded-lg bg-gray-100" />
            )}

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
            <View
              className={`${statusColorClass(
                request.status,
              )} px-3 py-1 rounded-lg`}
            >
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
