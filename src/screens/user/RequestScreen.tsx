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
import { formatTimestamp } from '../../utils/dateUtils';
import { getStatusBadgeClass } from '../../utils/status';
import { useIsFocused } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';
import MainLayout from '../../layout/MainLayout';
import StatusFilter from '../../components/ui/StatusFilter';

const RequestScreen = () => {
  const navigation = useNavigation<any>();
  const [requests, setRequests] = useState<any[]>([]);
  const [loading, setLoading] = useState(false);
  const [selectedStatus, setSelectedStatus] = useState<string>('');
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

  const filteredRequests = selectedStatus
    ? requests.filter(request => request.status === selectedStatus)
    : requests;

  const openRequest = (request: any) => {
    const status = (request.status || '').toLowerCase();
    if (status === 'đã hoàn thành') {
      navigation.navigate('UserNotificationDetail', { requestId: request.id });
    } else {
      navigation.navigate('DeliveryInfo', { requestId: request.id });
    }
  };

  const statusOptions = [
    { value: '', label: 'Tất cả', color: 'gray' },
    { value: 'đã từ chối', label: 'Từ chối', color: 'red' },
    { value: 'chờ duyệt', label: 'Chờ duyệt', color: 'yellow' },
    { value: 'đã duyệt', label: 'Đã duyệt', color: 'blue' },
    { value: 'đã hoàn thành', label: 'Hoàn thành', color: 'green' },
  ];

  const renderRequestTime = (request: any) => {
    // preserve previous inline logic: format request.date using formatTimestamp
    if (!request) return '';
    if (request.date) {
      const formatted = formatTimestamp(request.date);
      return formatted || request.date;
    }
    return '';
  };
  return (
    <MainLayout headerTitle="Yêu cầu của bạn">
      <View className="flex-1 bg-white">
        {/* Status Filter */}
        <StatusFilter
          options={statusOptions}
          selectedStatus={selectedStatus}
          onStatusChange={setSelectedStatus}
        />

        {/* Request List */}
        <ScrollView className="flex-1 px-4 mt-2">
          {loading ? (
            <View className="items-center justify-center py-12">
              <ActivityIndicator size="large" color="#4169E1" />
              <Text className="text-text-muted mt-4 text-center">
                Đang tải...
              </Text>
            </View>
          ) : filteredRequests.length === 0 ? (
            <View className="items-center justify-center py-12">
              <Icon name="inbox" size={64} color="#DDD" />
              <Text className="text-text-muted mt-4 text-center">
                Không có đơn hàng nào
              </Text>
            </View>
          ) : (
            filteredRequests.map((request: any) => (
              <TouchableOpacity
                key={request.id}
                className="flex-row items-center bg-white border border-gray-200 rounded-xl p-3 mb-3 shadow-sm"
                onPress={() => openRequest(request)}
              >
                {/* Image */}
                {request.imageUrls && request.imageUrls.length > 0 ? (
                  <Image
                    source={{ uri: request.imageUrls[0] }}
                    className="w-16 h-16 rounded-lg"
                    resizeMode="cover"
                  />
                ) : (
                  <View className="w-16 h-16 rounded-lg bg-gray-100" />
                )}

                {/* Content */}
                <View className="flex-1 ml-3">
                  <Text className="text-base font-semibold text-gray-900 mb-1">
                    {request.subCategory}
                  </Text>
                  <View className="flex-row items-center">
                    <Icon name="clock" size={14} color="#9ca3af" />
                    <Text className="text-sm text-gray-500 ml-1">
                      {renderRequestTime(request)}
                    </Text>
                  </View>
                </View>

                {/* Status Badge */}
                <View
                  className={`${getStatusBadgeClass(
                    request.status,
                  )} px-3 py-1 rounded-lg`}
                >
                  <Text className="text-xs font-medium text-white">
                    {request.status}
                  </Text>
                </View>
              </TouchableOpacity>
            ))
          )}
        </ScrollView>
      </View>
    </MainLayout>
  );
};

export default RequestScreen;
