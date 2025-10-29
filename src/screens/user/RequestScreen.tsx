import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  Image,
  TouchableOpacity,
  ScrollView,
  ActivityIndicator,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import requestService from '../../services/requestService';
import { useIsFocused } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import MainLayout from '../../layout/MainLayout';

const RequestScreen = () => {
  const navigation = useNavigation<any>();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const auth = useAppSelector(s => s.auth);
  const isFocused = useIsFocused();

  useEffect(() => {
    let mounted = true;
    const load = async () => {
      setLoading(true);
      try {
        const userId = auth.user?.userId;
        if (!userId) {
          if (mounted) setRequests([]);
          return;
        }
        const response = await requestService.getRequestBySenderId(userId);

        const list = response ?? [];

        const sorted = Array.isArray(list)
          ? [...list].sort((a: any, b: any) => {
              // createdAt
              if (a.createdAt && b.createdAt) {
                return (
                  new Date(b.createdAt).getTime() -
                  new Date(a.createdAt).getTime()
                );
              }
              // date field
              if (a.date && b.date) {
                try {
                  return (
                    new Date(b.date).getTime() - new Date(a.date).getTime()
                  );
                } catch (e) {
                  // ignore
                }
              }
              // numeric id
              const ai = parseInt(a.id, 10);
              const bi = parseInt(b.id, 10);
              if (!isNaN(ai) && !isNaN(bi)) return bi - ai;
              // fallback: keep original order
              return 0;
            })
          : [];
        if (mounted) setRequests(sorted as any[]);
      } catch (e) {
        if (mounted) setRequests([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };
    if (isFocused) load();
    return () => {
      mounted = false;
    };
  }, [isFocused]);

  const statusColorClass = (status: string) => {
    switch ((status || '').toLowerCase()) {
      case 'đã từ chối':
        return 'bg-red-500';
      case 'chờ duyệt':
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
      navigation.navigate('UserNotificationDetail', { requestId: request.id });
    } else {
      navigation.navigate('DeliveryInfo', { requestId: request.id });
    }
  };

  return (
    <MainLayout>
      <View className="flex-1 bg-white">
        {/* Title Section */}
        <View className="flex-row items-center justify-between px-4 py-4">
          <Text className="text-xl font-bold text-gray-900">
            Yêu cầu của tôi
          </Text>
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
          {loading && (
            <View className="w-full items-center justify-center py-20">
              <ActivityIndicator size="large" color="#4169E1" />
            </View>
          )}
          {!loading &&
            requests.map((request: any) => (
              <TouchableOpacity
                key={request.id}
                className="flex-row items-center bg-white border border-gray-200 rounded-xl p-3 mb-3 shadow-sm"
                onPress={() => openRequest(request)}
              >
                {/* Image */}
                {request.images && request.images.length > 0 ? (
                  <Image
                    source={{ uri: request.images[0] }}
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
                      {(() => {
                        // derive a short time label from schedule or date
                        if (request.schedule && request.schedule.length > 0) {
                          const first = request.schedule[0];
                          const slot = first.slots && first.slots[0];
                          if (slot && slot.startTime) {
                            return `${first.dayName} ${slot.startTime}`;
                          }
                          return first.dayName;
                        }
                        if (request.date) {
                          try {
                            const d = new Date(request.date);
                            return d.toLocaleDateString();
                          } catch (e) {
                            return request.date;
                          }
                        }
                        return '';
                      })()}
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
    </MainLayout>
  );
};

export default RequestScreen;
