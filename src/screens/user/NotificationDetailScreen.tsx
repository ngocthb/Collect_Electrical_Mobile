import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import SubLayout from '../../layout/SubLayout';
import trackingService from '../../services/trackingService';

interface TimelineItemProps {
  icon: string;
  title: string;
  subtitle: string;
  date: string;
  time: string;
  isLast?: boolean;
}

const TimelineItem: React.FC<TimelineItemProps> = ({
  icon,
  title,
  subtitle,
  date,
  time,
  isLast = false,
}) => (
  <View className="flex-row mt-1">
    <View className="items-center mr-4">
      <View className="w-10 h-10 rounded-full bg-blue-500 items-center justify-center">
        <Icon name={icon} size={20} color="#fff" />
      </View>
      {!isLast && <View className="w-0.5 flex-1 bg-gray-200 my-1" />}
    </View>
    <View className="flex-1 pb-6">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="font-semibold text-gray-900 text-sm flex-1">
          {title}
        </Text>
        <Text className="text-sm text-gray-400">{date}</Text>
      </View>
      <Text className="text-sm text-gray-600 mb-1">{subtitle}</Text>
      <Text className="text-sm text-gray-400 mt-1">{time}</Text>
    </View>
  </View>
);

interface NotificationDetailScreenProps {
  navigation: any;
  route: any;
}

const NotificationDetailScreen: React.FC<NotificationDetailScreenProps> = ({
  navigation,
  route,
}) => {
  const [timelineData, setTimelineData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const postId = 'a2d7b801-b0fb-4f7d-9b83-b741d23666a1';

  const mapStatusToIcon = (status: string) => {
    switch (status) {
      case 'created':
        return 'plus-circle';
      case 'scheduled':
        return 'calendar';
      case 'collected':
        return 'package';
      case 'collection_failed':
        return 'x-circle';
      case 'at_warehouse':
        return 'archive';
      case 'packaged':
        return 'box';
      case 'in_transit':
        return 'truck';
      case 'at_recycling_unit':
        return 'refresh-cw';
      default:
        return 'info';
    }
  };

  const mapStatusToLabel = (status: string) => {
    switch (status) {
      case 'created':
        return 'Yêu cầu đã tạo';
      case 'scheduled':
        return 'Đã lên lịch';
      case 'collected':
        return 'Lấy hàng thành công';
      case 'collection_failed':
        return 'Lấy hàng thất bại';
      case 'at_warehouse':
        return 'Đã đến kho';
      case 'packaged':
        return 'Đã đóng gói';
      case 'in_transit':
        return 'Đang vận chuyển';
      case 'at_recycling_unit':
        return 'Đã đến điểm tái chế';
      default:
        return status;
    }
  };

  useEffect(() => {
    let mounted = true;
    const fetchTimeline = async () => {
      if (!postId) return;
      setLoading(true);
      try {
        const data: any = await trackingService.getPostTimeline(String(postId));
        if (!mounted) return;
        // map items to UI model and sort in reverse chronological order (newest first)
        const parseDateTime = (it: any) => {
          try {
            if (!it || !it.date) return new Date(0);
            const parts = String(it.date).split('/'); // dd/mm/yyyy
            const d = Number(parts[0] || 0);
            const m = Number(parts[1] || 1) - 1;
            const y = Number(parts[2] || 1970);
            const tparts = String(it.time || '').split(':');
            const hh = Number(tparts[0] || 0);
            const mm = Number(tparts[1] || 0);
            return new Date(y, m, d, hh, mm);
          } catch (e) {
            return new Date(0);
          }
        };

        const mapped = Array.isArray(data)
          ? data
              .slice()
              .sort((a: any, b: any) => {
                const da = parseDateTime(a).getTime();
                const db = parseDateTime(b).getTime();
                return db - da; // newest first
              })
              .map((it: any, idx: number) => ({
                id: `${idx}`,
                icon: mapStatusToIcon(it.status),
                title: mapStatusToLabel(it.status),
                subtitle: it.description,
                date: it.date,
                time: it.time,
              }))
          : [];
        setTimelineData(mapped);
      } catch (e) {
        console.warn('Failed to load timeline', e);
        setTimelineData([]);
      } finally {
        if (mounted) setLoading(false);
      }
    };

    fetchTimeline();
    return () => {
      mounted = false;
    };
  }, [postId]);

  return (
    <SubLayout
      title="Lộ trình giao nhận"
      onBackPress={() => navigation.goBack()}
    >
      <View className="flex-1 bg-gray-50">
        <ScrollView className="flex-1  mt-4">
          {/* Shipper Info */}
          {/* <View className="bg-white px-6 py-4 mb-2">
            <Text className="text-sm text-text-muted mb-3">
              Người vận chuyển:
            </Text>
            <View className="flex-row items-center gap-3">
              <Image source={avatar} className="w-12 h-12 rounded-full" />
              <View className="flex-1">
                <Text className="font-semibold text-gray-900 text-base">
                  Naruto
                </Text>
                <Text className="text-sm text-gray-500">
                  Phương tiện: xe tải nhỏ
                </Text>
                <Text className="text-sm text-gray-500">
                  Biển số xe: 60F1-123.456
                </Text>
              </View>
            </View>
          </View> */}
          {/* Timeline */}
          <View className="bg-white px-6 py-4">
            <Text className="text-sm text-gray-600 mb-4">Chi tiết:</Text>
            {loading ? (
              <ActivityIndicator size="small" color="#3B82F6" />
            ) : timelineData && timelineData.length > 0 ? (
              timelineData.map((item, idx) => (
                <TimelineItem
                  key={item.id}
                  icon={item.icon}
                  title={item.title}
                  subtitle={item.subtitle}
                  date={item.date}
                  time={item.time}
                  isLast={idx === timelineData.length - 1}
                />
              ))
            ) : (
              <Text className="text-sm text-gray-500">
                Không có dữ liệu lộ trình
              </Text>
            )}
          </View>
        </ScrollView>
      </View>
    </SubLayout>
  );
};

export default NotificationDetailScreen;
