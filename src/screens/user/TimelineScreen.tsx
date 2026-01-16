import React, { useEffect, useState } from 'react';
import { View, Text, ScrollView, ActivityIndicator } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import SubLayout from '../../layout/SubLayout';
import trackingService from '../../services/trackingService';
import { mapTimelineData } from '../../utils/timelineHelper';
import type { ProductInfo } from '../../types/Timeline';
import ImageGalleryViewer from '../../components/ui/ImageGalleryViewer';
import { getStatusBgClass, getStatusLabel } from '../../utils/productHelper';
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
      <View className="flex-row justify-between items-start">
        <Text className="text-sm  text-text-main mb-1">{subtitle}</Text>
        <Text className="text-sm text-gray-600 mt-1">{time}</Text>
      </View>
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
  const [product, setProduct] = useState<ProductInfo>();
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
        const mapped = mapTimelineData(data.timeline);
        setTimelineData(mapped);
        setProduct(data.productInfo);
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
      noScroll={true}
    >
      <View className="flex-1 px-6  bg-background-50">
        {product && (
          <View className="bg-white border-2 border-red-200  rounded-2xl shadow-lg mb-1 py-3 px-2 ">
            <View className="flex-row justify-between items-center mb-2 p">
              {product?.categoryName && (
                <Text className="text-primary-100 text-xs font-semibold uppercase tracking-wider ">
                  {product.categoryName} • {product.brandName}
                </Text>
              )}
              <View
                className={`${getStatusBgClass(
                  product?.status,
                )} px-3 py-1 rounded-lg `}
              >
                <Text className="text-xs font-medium text-white">
                  {getStatusLabel(product?.status)}
                </Text>
              </View>
            </View>
            {/* request thumbnail */}
            <ImageGalleryViewer images={product?.images || []} />

            <View className="space-y-4">
              <View className="flex pt-3 ">
                <View className="flex-row items-center">
                  <View className="w-6 h-6 rounded-full bg-primary-50 items-center justify-center">
                    <Icon name="map-pin" size={12} color="#fff" />
                  </View>
                  <View
                    style={{
                      flex: 1,
                      marginLeft: 12,
                      alignItems: 'flex-start',
                      minHeight: 30,
                    }}
                  >
                    <Text
                      style={{ textAlign: 'left' }}
                      className="text-text-sub text-sm"
                    >
                      {product?.address ?? '—'}
                    </Text>
                  </View>
                </View>
                {product?.description && (
                  <View className="flex-row items-center mt-2">
                    <View className="w-6 h-6 rounded-full bg-primary-50 items-center justify-center">
                      <Icon name="layers" size={12} color="#fff" />
                    </View>
                    <View
                      style={{
                        flex: 1,
                        marginLeft: 12,
                        alignItems: 'flex-start',
                      }}
                    >
                      <Text
                        style={{ textAlign: 'left' }}
                        className="text-text-sub text-sm"
                      >
                        {product?.description ?? '—'}
                      </Text>
                    </View>
                  </View>
                )}
              </View>
            </View>
          </View>
        )}
        <ScrollView className="flex-1 mt-2">
          <View className="py-4">
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
