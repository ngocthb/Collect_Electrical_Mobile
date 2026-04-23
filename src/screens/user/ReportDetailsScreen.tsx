import React, { useEffect, useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  ActivityIndicator,
  Image,
  TouchableOpacity,
  FlatList,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useRoute, useNavigation } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';

import SubLayout from '../../layout/SubLayout';
import { Report } from '../../types/report';
import reportService from '../../services/reportService';
import {
  getStatusColor,
  formatReportDate,
  getTypeColor,
} from '../../utils/reportHelper';
import ImageViewerModal from '../../components/ImageViewerModal';

interface RouteParams {
  reportId: string;
  report?: Report;
}

export default function ReportDetailsScreen() {
  const route = useRoute();
  const navigation = useNavigation<any>();
  const { reportId, report: initialReport } = route.params as RouteParams;
  const { user } = useAppSelector(s => s.auth);

  const [report, setReport] = useState<Report | null>(initialReport || null);
  const [loading, setLoading] = useState(!initialReport);
  const [selectedImageIndex, setSelectedImageIndex] = useState(0);
  const [showImageGallery, setShowImageGallery] = useState(false);

  useEffect(() => {
    if (!initialReport) {
      loadReportDetails();
    }
  }, [reportId]);

  const loadReportDetails = async () => {
    try {
      setLoading(true);
      const response = await reportService.getReportDetails(reportId);
      if (response?.data) {
        setReport(response.data);
      }
    } catch (error) {
      console.error('[ReportDetails] Error loading report:', error);
    } finally {
      setLoading(false);
    }
  };

  if (loading) {
    return (
      <SubLayout
        title="Chi tiết phản ánh"
        onBackPress={() => navigation.goBack()}
      >
        <View className="flex-1 justify-center items-center bg-background-50">
          <ActivityIndicator size="large" color="#e85a4f" />
        </View>
      </SubLayout>
    );
  }

  if (!report) {
    return (
      <SubLayout
        title="Chi tiết phản ánh"
        onBackPress={() => navigation.goBack()}
      >
        <View className="flex-1 justify-center items-center bg-background-50">
          <Icon name="alert-circle" size={48} color="#E5E7EB" />
          <Text className="text-gray-400 mt-3">Không tìm thấy phản ánh</Text>
        </View>
      </SubLayout>
    );
  }

  const statusColor = getStatusColor(report.status);
  const typeColor = getTypeColor(report.reportType);
  const hasAnswer = report.answerMessage && report.answerMessage !== 'null';
  const hasImages = report.reportImages && report.reportImages.length > 0;

  const renderImageThumbnail = ({
    item,
    index,
  }: {
    item: string;
    index: number;
  }) => (
    <TouchableOpacity
      key={index}
      onPress={() => {
        setSelectedImageIndex(index);
        setShowImageGallery(true);
      }}
      className="mr-3 rounded-xl overflow-hidden"
    >
      <Image
        source={{ uri: item }}
        style={{ width: 100, height: 100 }}
        className="rounded-xl"
      />
    </TouchableOpacity>
  );

  return (
    <SubLayout
      title="Chi tiết phản ánh"
      onBackPress={() => navigation.goBack()}
    >
      <View className="flex-1 bg-background-50">
        <ScrollView className="px-5 py-4">
          {/* Report Description */}
          <View className="bg-white border-2 border-red-200 rounded-2xl shadow-lg mb-3 p-4">
            <View className="flex-row items-center justify-between mb-3">
              <Text className="text-primary-100 text-xs font-semibold uppercase tracking-wider ">
                {report.reportType}
              </Text>
              <View
                style={{ backgroundColor: statusColor }}
                className="px-3 py-1.5 rounded-lg ml-2"
              >
                <Text className="text-white text-xs font-semibold">
                  {report.status}
                </Text>
              </View>
            </View>
            <Text className="text-gray-700 text-sm leading-5.5">
              {report.reportDescription}
            </Text>
            <Text className="text-gray-400 text-xs mt-3 text-right">
              {formatReportDate(report.createdAt)}
            </Text>
          </View>

          {/* Images Section */}
          {hasImages && (
            <View className="bg-white border-2 border-red-200 rounded-2xl shadow-lg mb-3 p-4">
              <Text className="text-primary-100 text-xs font-semibold uppercase tracking-wider mb-3">
                Hình ảnh đính kèm ({report.reportImages?.length || 0})
              </Text>
              <FlatList
                data={report.reportImages}
                renderItem={renderImageThumbnail}
                keyExtractor={(_, index) => `image-${index}`}
                scrollEnabled={true}
                horizontal={true}
                showsHorizontalScrollIndicator={false}
              />
            </View>
          )}

          {/* Answer Section */}
          {hasAnswer && (
            <View className="bg-white border-2 border-green-200 rounded-2xl shadow-lg mb-3 p-4">
              <View className="flex-row items-center justify-between mb-3">
                <Text className="text-green-600 text-xs font-semibold uppercase tracking-wider">
                  Phản hồi từ nhân viên
                </Text>
                {report.resolvedAt && (
                  <Text className="text-gray-400 text-xs mt-2">
                    {formatReportDate(report.resolvedAt)}
                  </Text>
                )}
              </View>
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-green-100 items-center justify-center mr-2 mt-0.5">
                  <Icon name="corner-down-right" size={20} color="#10B981" />
                </View>
                <View className="flex-1">
                  <Text className="text-gray-700 text-sm leading-5.5">
                    {report.answerMessage}
                  </Text>
                </View>
              </View>
            </View>
          )}

          {/* Waiting for Response */}
          {!hasAnswer && (
            <View className="bg-white border-2 border-yellow-200 rounded-2xl shadow-lg mb-3 p-4">
              <Text className="text-yellow-600 text-xs font-semibold uppercase tracking-wider mb-3">
                Trạng thái xử lý
              </Text>
              <View className="flex-row items-center">
                <View className="w-10 h-10 rounded-full bg-yellow-100 items-center justify-center mr-2">
                  <Icon name="clock" size={20} color="#F59E0B" />
                </View>
                <Text className="text-gray-600 text-sm">
                  Đang chờ phản hồi từ nhân viên
                </Text>
              </View>
            </View>
          )}

          <View className="h-6" />
        </ScrollView>
      </View>

      {/* Image Gallery Modal */}
      {showImageGallery && report.reportImages && (
        <ImageViewerModal
          images={report.reportImages}
          initialIndex={selectedImageIndex}
          visible={showImageGallery}
          onClose={() => setShowImageGallery(false)}
        />
      )}
    </SubLayout>
  );
}
