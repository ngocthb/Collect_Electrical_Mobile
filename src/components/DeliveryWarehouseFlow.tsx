import React, { useState } from 'react';
import { View, Text, ScrollView, TouchableOpacity, Image } from 'react-native';
import toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';
import ScanQrComponent from './ScanQrComponent';
import { getDetails } from '../services/warehouseService';

interface DeliveryWarehouseFlowProps {
  onComplete: (data: {
    containerId: string;
    containerDetails: any;
    finalQrCode: string;
  }) => void;
  onCancel: () => void;
}

const DeliveryWarehouseFlow: React.FC<DeliveryWarehouseFlowProps> = ({
  onComplete,
  onCancel,
}) => {
  const [containerId, setContainerId] = useState<string | null>(null);
  const [containerDetails, setContainerDetails] = useState<any>(null);
  const [finalQrCode, setFinalQrCode] = useState<string | null>(null);
  const [error, setError] = useState<string | null>(null);

  const handleScanQr = async (qrCode: string) => {
    try {
      console.log(qrCode);
      setError(null);

      const details = await getDetails(qrCode);

      if (!details) {
        throw new Error('Mã QR không hợp lệ hoặc không tìm thấy thông tin ');
      }

      setContainerId(qrCode);
      setContainerDetails(details);
      toast.show({
        type: 'success',
        text1: 'Thành công',
        text2: 'Thông tin thùng hàng đã lưu',
      });
    } catch (err: any) {
      setError(
        err?.message || 'Mã QR không hợp lệ hoặc không tìm thấy thông tin',
      );
      toast.show({
        type: 'error',
        text1: 'Lỗi',
        text2: err?.message || 'Lỗi khi quét mã QR',
      });
    }
  };

  const handleFinalScanQr = (qrCode: string) => {
    setFinalQrCode(qrCode);
    if (containerId && containerDetails && qrCode) {
      toast.show({
        type: 'success',
        text1: 'Hoàn tất',
        text2: 'Thông tin phát hàng đã được ghi lại',
      });
      onComplete({
        containerId,
        containerDetails,
        finalQrCode: qrCode,
      });
    }
  };

  const isStep1Complete = containerId && containerDetails;
  const isStep3Complete = finalQrCode !== null;

  return (
    <View className="flex-1 bg-background-50">
      <ScrollView className="flex-1 ">
        {/* Step 1: Scan QR */}
        <View className="mb-4">
          <View className="flex-row items-center mb-4">
            <View
              className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                isStep1Complete ? 'bg-green-600' : 'bg-primary-100'
              }`}
            >
              <Text className="text-white font-bold text-sm">1</Text>
            </View>
            <Text className="text-base font-bold text-gray-900">
              Quét mã QR thùng tái chế
            </Text>
            {isStep1Complete && (
              <Icon
                name="check-circle"
                size={20}
                color="#10B981"
                className="ml-auto"
              />
            )}
          </View>

          {isStep1Complete ? (
            <View className="bg-white rounded-xl p-4 border border-green-200">
              <View className="flex-row items-center mb-3">
                <Icon name="check-circle" size={24} color="#10B981" />
                <Text className="text-green-600 font-semibold ml-3">
                  Tên thùng tái chế: {containerDetails?.name || 'Thùng tái chế'}
                </Text>
              </View>
              {containerDetails?.description && (
                <Text className="text-sm text-gray-600">
                  {containerDetails.description}
                </Text>
              )}
              <TouchableOpacity
                onPress={() => {
                  setContainerId(null);
                  setContainerDetails(null);
                }}
                className="mt-3"
              >
                <Text className="text-sm text-primary-600 font-semibold">
                  Quét lại
                </Text>
              </TouchableOpacity>
            </View>
          ) : (
            <View className="mb-4">
              <ScanQrComponent
                onClose={onCancel}
                onScan={handleScanQr}
                title=""
                subtitle="Quét mã QR dán trên thùng tái chế để lấy thông tin"
              />
            </View>
          )}
        </View>

        {/* Step 2: Final Scan QR */}
        {isStep1Complete && (
          <View>
            <View className="flex-row items-center mb-4">
              <View
                className={`w-8 h-8 rounded-full items-center justify-center mr-3 ${
                  isStep3Complete ? 'bg-green-600' : 'bg-primary-100'
                }`}
              >
                <Text className="text-white font-bold text-sm">2</Text>
              </View>
              <Text className="text-base font-bold text-gray-900">
                Quét mã QR được dán trên sản phẩm
              </Text>
              {isStep3Complete && (
                <Icon
                  name="check-circle"
                  size={20}
                  color="#10B981"
                  className="ml-auto"
                />
              )}
            </View>

            {isStep3Complete ? (
              <View className="bg-white rounded-xl p-4 border border-green-200 mb-4">
                <View className="flex-row items-center mb-3">
                  <Icon name="check-circle" size={24} color="#10B981" />
                  <Text className="text-green-600 font-semibold ml-3">
                    Quét thành công
                  </Text>
                </View>
                <View className="bg-gray-50 p-3 rounded-lg mt-3 mb-3">
                  <Text className="text-xs text-gray-600 mb-1">Mã ID:</Text>
                  <Text className="text-sm font-mono font-bold text-gray-900">
                    {finalQrCode}
                  </Text>
                </View>
                <TouchableOpacity
                  onPress={() => setFinalQrCode(null)}
                  className="mt-3"
                >
                  <Text className="text-sm text-primary-600 font-semibold">
                    Quét lại
                  </Text>
                </TouchableOpacity>
              </View>
            ) : (
              <View className="mb-4">
                <ScanQrComponent
                  onClose={onCancel}
                  onScan={handleFinalScanQr}
                  title=""
                  subtitle="Quét mã QR dán trên sản phẩm để xác nhận thông tin"
                />
              </View>
            )}
          </View>
        )}

        {error && (
          <View className="bg-red-50 border-l-4 border-red-500 p-4 mb-6 rounded">
            <View className="flex-row items-start">
              <Icon name="alert-circle" size={20} color="#ef4444" />
              <View className="flex-1 ml-3">
                <Text className="font-semibold text-red-800">Lỗi</Text>
                <Text className="text-red-700 text-sm">{error}</Text>
              </View>
            </View>
          </View>
        )}
      </ScrollView>
    </View>
  );
};

export default DeliveryWarehouseFlow;
