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
      <View className="w-10 h-10 rounded-full bg-primary-100 items-center justify-center">
        <Icon name={icon} size={20} color="#fff" />
      </View>
      {!isLast && <View className="w-0.5 flex-1 bg-primary-100 my-1" />}
    </View>
    <View className="flex-1 pb-6">
      <View className="flex-row justify-between items-start mb-1">
        <Text className="font-semibold text-primary-100 text-sm flex-1">
          {title}
        </Text>
        <Text className="text-sm text-gray-600">{date}</Text>
      </View>
      <Text className="text-sm  text-text-main mb-1">{subtitle}</Text>
      <Text className="text-sm text-gray-600 mt-1">{time}</Text>
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

  const productId = route.params.productId;

  const mapStatusToIcon = (status: string) => {
    const s = String(status || '')
      .trim()
      .toLowerCase();
    // Vietnamese status mappings
    if (s === 'chờ duyệt') return 'clock';
    if (s === 'chờ thu gom') return 'calendar';
    if (s === 'đã thu gom' || s === 'đã lấy hàng' || s === 'đã thu gom')
      return 'package';
    if (s === 'nhập kho') return 'archive';
    if (s === 'đã đóng thùng' || s === 'đã đóng gói' || s === 'đã đóng thùng')
      return 'check-circle';

    // Fallbacks for English/internal codes
    switch (s) {
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
    const s = String(status || '')
      .trim()
      .toLowerCase();
    if (s === 'chờ duyệt') return 'Chờ duyệt';
    if (s === 'chờ thu gom') return 'Chờ thu gom';
    if (s === 'đã thu gom') return 'Đã thu gom';
    if (s === 'nhập kho') return 'Nhập kho';
    if (s === 'đã đóng thùng' || s === 'đã đóng gói') return 'Đã đóng thùng';

    switch (s) {
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
      if (!productId) return;
      setLoading(true);
      try {
        const data: any = await trackingService.getPostTimeline(
          String(productId),
        );
        if (!mounted) return;

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
        console.log(data);
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
  }, [productId]);

  return (
    <SubLayout
      title="Lộ trình giao nhận"
      onBackPress={() => navigation.goBack()}
    >
      <View className="flex-1 bg-background-50">
        <ScrollView className="flex-1  mt-4">
          <View className="px-6 py-4">
            {loading ? (
              <ActivityIndicator size="small" color="#e85a4f" />
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
              <View className="items-center justify-center py-12">
                <Icon name="inbox" size={64} color="#e85a4f" />
                <Text className="text-sm text-gray-500 mt-6">
                  Không có dữ liệu lộ trình
                </Text>
              </View>
            )}
          </View>
        </ScrollView>
      </View>
    </SubLayout>
  );
};

export default NotificationDetailScreen;
