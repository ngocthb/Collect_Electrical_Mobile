import React, { useEffect, useState, useRef } from 'react';
import {
  View,
  Text,
  TouchableOpacity,
  FlatList,
  ActivityIndicator,
  RefreshControl,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import IconIon from 'react-native-vector-icons/Ionicons';
import { useNavigation } from '@react-navigation/native';
import { useIsFocused } from '@react-navigation/native';
import { useAppSelector } from '../../store/hooks';

import reportService from '../../services/reportService';
import { Report } from '../../types/report';
import SubLayout from '../../layout/SubLayout';
import AppAvatar from '../../components/ui/AppAvatar';
import ReportCreateModal from '../../components/ReportCreateModal';
import {
  getStatusColor,
  formatReportDate,
  filterReportsByType,
} from '../../utils/reportHelper';
import AppButton from '../../components/ui/AppButton';

export default function ReportListScreen() {
  const navigation = useNavigation<any>();
  const { user } = useAppSelector(s => s.auth);
  const isFocused = useIsFocused();
  const [reports, setReports] = useState<Report[]>([]);
  const [loading, setLoading] = useState(false);
  const [loadingMore, setLoadingMore] = useState(false);
  const [refreshing, setRefreshing] = useState(false);
  const [page, setPage] = useState(1);
  const [hasMore, setHasMore] = useState(true);
  const [selectedType, setSelectedType] = useState('');
  const [filterDropdownOpen, setFilterDropdownOpen] = useState(false);
  const [reportTypes, setReportTypes] = useState<any[]>([]);
  const [expandedReports, setExpandedReports] = useState<Set<string>>(
    new Set(),
  );
  const [showCreateModal, setShowCreateModal] = useState(false);
  const isMounted = useRef(true);

  const loadReportTypes = async () => {
    try {
      const types = await reportService.getReportType();
      console.log(types);
      if (isMounted.current && types) {
        setReportTypes(types);
      }
    } catch (e) {
      console.error('[ReportList] Error loading report types:', e);
    }
  };

  const loadReports = async (
    pageNum: number = 1,
    append: boolean = false,
    filterType: string = '',
  ) => {
    if (!user?.userId) {
      if (isMounted.current) setReports([]);
      return;
    }

    if (pageNum === 1) {
      setLoading(true);
    } else {
      setLoadingMore(true);
    }

    try {
      const response = await reportService.viewMyReport(
        pageNum,
        user.userId,
        filterType || selectedType,
      );

      if (isMounted.current) {
        const newReports = response?.data || [];

        if (append) {
          setReports(prev => [...prev, ...newReports]);
        } else {
          setReports(newReports);
        }

        setHasMore(newReports.length >= 10);
      }
    } catch (e) {
      console.error('[ReportList] Error loading reports:', e);
      if (isMounted.current && !append) setReports([]);
    } finally {
      if (isMounted.current) {
        setLoading(false);
        setLoadingMore(false);
        setRefreshing(false);
      }
    }
  };

  const loadMore = () => {
    if (!loadingMore && !loading && hasMore) {
      const nextPage = page + 1;
      setPage(nextPage);
      loadReports(nextPage, true);
    }
  };

  const handleRefresh = async () => {
    setRefreshing(true);
    setPage(1);
    setHasMore(true);
    await loadReports(1, false);
  };

  const handleTypeChange = (type: string) => {
    setSelectedType(type);
    setFilterDropdownOpen(false);
    setPage(1);
    setHasMore(true);
    loadReports(1, false, type);
  };

  const toggleExpandReport = (reportId: string) => {
    setExpandedReports(prev => {
      const newSet = new Set(prev);
      if (newSet.has(reportId)) {
        newSet.delete(reportId);
      } else {
        newSet.add(reportId);
      }
      return newSet;
    });
  };

  const REPORT_TYPE_COLORS: { [key: string]: string } = {
    'Lỗi hệ thống': '#EF4444',
    'Vấn đề thu gom': '#14B8A6',
    'Lỗi điểm thu gom': '#3B82F6',
  };

  const getTypeColor = (type: string): string => {
    return REPORT_TYPE_COLORS[type] || '#999999';
  };

  useEffect(() => {
    isMounted.current = true;
    if (isFocused) {
      loadReportTypes();
      setPage(1);
      setHasMore(true);
      loadReports(1, false);
    }
    return () => {
      isMounted.current = false;
    };
  }, [isFocused]);

  const renderReportItem = ({ item }: { item: Report }) => {
    const statusColor = getStatusColor(item.status);
    const formattedDate = formatReportDate(item.createdAt);
    const isExpanded = expandedReports.has(item.reportId);
    const hasAnswer = item.answerMessage && item.answerMessage !== 'null';

    return (
      <View className="bg-white mb-3 rounded-lg overflow-hidden border border-gray-100">
        {/* Status color top bar */}
        <View style={{ height: 3, backgroundColor: statusColor }} />

        <View className="p-3">
          {/* Header: Avatar + UserName + Type + Status */}
          <View className="flex-row justify-between items-start mb-3">
            <View className="flex-row flex-1 items-center">
              <AppAvatar name={item.reportUserName} size={40} />
              <View className="ml-3 flex-1">
                <Text className="text-sm text-gray-500">
                  {item.reportUserName}
                </Text>
                <Text className="text-sm font-semibold text-primary-100 mt-1">
                  {item.reportType}
                </Text>
              </View>
            </View>

            <View
              style={{ backgroundColor: statusColor }}
              className="w-20 h-7 rounded-lg items-center justify-center"
            >
              <Text className="text-white text-[10px] font-semibold">
                {item.status}
              </Text>
            </View>
          </View>

          {/* Description */}
          <View className="mb-3 pb-3 border-b border-gray-100">
            <Text className="text-sm text-gray-600 leading-5">
              {item.reportDescription}
            </Text>
          </View>

          {/* Expandable Answer Section */}
          {hasAnswer && (
            <TouchableOpacity
              onPress={() => toggleExpandReport(item.reportId)}
              className="flex-row items-center justify-between py-2"
            >
              <Text className="text-sm font-medium text-primary-100">
                {isExpanded ? 'Ẩn phản hồi' : 'Xem phản hồi'}
              </Text>
              <Icon
                name={isExpanded ? 'chevron-up' : 'chevron-down'}
                size={16}
                color="#e85a4f"
              />
            </TouchableOpacity>
          )}

          {isExpanded && hasAnswer && (
            <View className="mt-3 pt-3 border-t border-gray-100 bg-gray-50 rounded-lg p-3">
              <View className="flex-row items-center mb-2 gap-2">
                <Icon name="corner-down-right" size={16} />
                <Text className="text-sm text-gray-600  leading-5">
                  {item.answerMessage}
                </Text>
              </View>

              <Text className="text-sm text-gray-400 mt-2 text-right">
                {formattedDate}
              </Text>
            </View>
          )}

          {/* Date (if no answer or collapsed) */}
          {!hasAnswer && (
            <Text className="text-sm text-right text-gray-500">
              {formattedDate}
            </Text>
          )}
        </View>
      </View>
    );
  };

  const renderFooter = () => {
    if (!loadingMore) return null;
    return (
      <View className="py-4">
        <ActivityIndicator size="small" color="#e85a4f" />
      </View>
    );
  };

  const renderEmptyState = () => {
    if (loading) return null;
    return (
      <View className="flex-1 justify-center items-center py-20">
        <Icon name="inbox" size={48} color="#E5E7EB" />
        <Text className="text-gray-400 mt-3 text-center">
          Chưa có phản ánh nào
        </Text>
      </View>
    );
  };

  const filterDropdown = (
    <View className="relative">
      <TouchableOpacity
        onPress={() => setFilterDropdownOpen(!filterDropdownOpen)}
        className={`flex-row items-center px-3 py-1.5 rounded-lg border ${
          selectedType === ''
            ? 'border-red-200 bg-white'
            : 'border-gray-200 bg-primary-100'
        }`}
      >
        {selectedType !== '' && (
          <View
            style={{
              width: 6,
              height: 6,
              borderRadius: 3,
              backgroundColor: getTypeColor(selectedType),
              marginRight: 6,
            }}
          />
        )}
        <Text
          className={`text-xs font-medium mr-2 ${
            selectedType === '' ? 'text-primary-100' : 'text-white'
          }`}
        >
          {selectedType || 'Tất cả'}
        </Text>
        <IconIon
          name="funnel-outline"
          size={16}
          color={selectedType === '' ? '#e85a4f' : '#fff'}
        />
      </TouchableOpacity>

      {filterDropdownOpen && (
        <>
          <TouchableOpacity
            style={{
              position: 'absolute',
              top: -1000,
              left: -1000,
              right: -1000,
              bottom: -1000,
              zIndex: 998,
            }}
            activeOpacity={1}
            onPress={() => setFilterDropdownOpen(false)}
          />

          <View
            className="absolute top-11 right-0 w-48 bg-white rounded-lg border border-gray-200 shadow-lg"
            style={{ zIndex: 999, elevation: 5 }}
          >
            <TouchableOpacity
              onPress={() => handleTypeChange('')}
              className={`px-3 py-2.5 border-b border-gray-100 ${
                selectedType === '' ? 'bg-gray-50' : 'bg-white'
              }`}
            >
              <Text
                className={`text-[13px] text-gray-700 ${
                  selectedType === '' ? 'font-semibold' : 'font-normal'
                }`}
              >
                Tất cả
              </Text>
            </TouchableOpacity>
            {reportTypes.map((type, index) => (
              <TouchableOpacity
                key={type}
                onPress={() => handleTypeChange(type)}
                className={`px-3 py-2.5 flex-row items-center ${
                  index < reportTypes.length - 1
                    ? 'border-b border-gray-100'
                    : ''
                } ${selectedType === type ? 'bg-gray-50' : 'bg-white'}`}
              >
                <View
                  style={{
                    width: 8,
                    height: 8,
                    borderRadius: 4,
                    backgroundColor: getTypeColor(type),
                    marginRight: 10,
                  }}
                />
                <Text
                  className={`text-[13px] text-gray-700 ${
                    selectedType === type ? 'font-semibold' : 'font-normal'
                  }`}
                >
                  {type}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </>
      )}
    </View>
  );

  return (
    <>
      <SubLayout
        title="Phản ánh dịch vụ"
        onBackPress={() => navigation.goBack()}
        noScroll={true}
        rightComponent={filterDropdown}
      >
        <View className="flex-1 px-4 py-4">
          {/* Reports List */}
          {loading && reports.length === 0 ? (
            <View className="flex-1 justify-center items-center">
              <ActivityIndicator size="large" color="#e85a4f" />
            </View>
          ) : (
            <FlatList
              data={reports}
              renderItem={renderReportItem}
              keyExtractor={item => item.reportId}
              onEndReached={loadMore}
              onEndReachedThreshold={0.5}
              ListFooterComponent={renderFooter}
              ListEmptyComponent={renderEmptyState}
              extraData={expandedReports}
              refreshControl={
                <RefreshControl
                  refreshing={refreshing}
                  onRefresh={handleRefresh}
                  tintColor="#e85a4f"
                />
              }
              scrollEnabled={true}
            />
          )}

          <AppButton
            title="Tạo phản ánh mới"
            onPress={() => setShowCreateModal(true)}
          />
        </View>
      </SubLayout>

      <ReportCreateModal
        visible={showCreateModal}
        reportType="Lỗi hệ thống"
        showTypeSelector
        onClose={() => setShowCreateModal(false)}
        onSuccess={() => {
          setPage(1);
          setHasMore(true);
          loadReports(1, false);
        }}
      />
    </>
  );
}
