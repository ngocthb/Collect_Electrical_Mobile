import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import SubLayout from '../../layout/SubLayout';
import trackingService from '../../services/trackingService';
import { mapTimelineData } from '../../utils/timelineHelper';

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

interface TimelineScreenProps {
  navigation: any;
  route: any;
}

const TimelineScreen: React.FC<TimelineScreenProps> = ({
  navigation,
  route,
}) => {
  const [timelineData, setTimelineData] = useState<any[] | null>(null);
  const [loading, setLoading] = useState(false);

  const productId = route.params.productId;

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

        console.log(data);
        const mapped = mapTimelineData(data);
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

export default TimelineScreen;
