import React, { useState } from 'react';
import {
  View,
  Text,
  ScrollView,
  Image,
  TouchableOpacity,
  Dimensions,
} from 'react-native';
import toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';
import ScanQrComponent from '../../components/ScanQrComponent';
import AppButton from '../../components/ui/AppButton';
import AppAvatar from '../../components/ui/AppAvatar';
import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/core';
import routeService from '../../services/routeService';
import ImageModal from '../../components/ui/ImageModal';
import ImageGalleryViewer from '../../components/ui/ImageGalleryViewer';
const { width, height } = Dimensions.get('window');
const UserConfirmScreen = () => {
  const [shipperId, setShipperId] = useState<string | null>(null);
  const [shipperInfo, setShipperInfo] = useState<any | null>(null);
  const [isModalVisible, setModalVisible] = useState(false);
  const [code, setCode] = useState<string | null>(null);
  const [selectedImage, setSelectedImage] = useState<string | null>(null);
  const navigation = useNavigation<any>();
  const [request, setRequest] = useState<any | null>(null);
  const toggleModal = () => {
    setModalVisible(!isModalVisible);
  };

  // Handle QR scan
  const handleQRScan = (data: string) => {
    try {
      const parsed = JSON.parse(String(data));

      if (parsed && typeof parsed === 'object') {
        const sid = parsed.code || parsed.shipper?.id || parsed.shipperId;

        if (!parsed.code || !parsed.shipper || !parsed.request) {
          toast.show({
            type: 'error',
            text1: 'Mã QR không hợp lệ',
            text2: 'Vui lòng quét mã QR hợp lệ của người giao hàng',
          });
          return;
        }

        if (parsed.code) {
          setCode(parsed.code);
        }
        if (parsed.shipper) {
          setShipperInfo(parsed.shipper);
        }

        if (parsed.request) {
          setRequest(parsed.request);
        }

        if (sid) {
          setShipperId(String(sid));
        } else {
          toast.show({
            type: 'error',
            text1: 'Mã QR không hợp lệ',
            text2: 'Vui lòng quét mã QR hợp lệ của người giao hàng',
          });
        }

        return;
      }
    } catch (e) {
      toast.show({
        type: 'error',
        text1: 'Mã QR không hợp lệ',
        text2: 'Vui lòng quét mã QR hợp lệ của người giao hàng',
      });
      return;
    }

    // Fallback: Invalid format
    toast.show({
      type: 'error',
      text1: 'Mã QR không hợp lệ',
      text2: 'Vui lòng quét mã QR hợp lệ của người giao hàng',
    });
  };

  const handleConfirm = async () => {
    if (code) {
      await routeService.userConfirmRouter(code, true, false);
    }
    toast.show({
      type: 'success',
      text1: 'Xác nhận',
      text2: 'Bạn đã xác nhận người giao hàng thành công!',
    });
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };

  const handleReject = async () => {
    if (code) {
      await routeService.userConfirmRouter(code, false, false);
    }
    toast.show({
      type: 'success',
      text1: 'Từ chối',
      text2: 'Bạn đã từ chối người giao hàng thành công!',
    });
    navigation.reset({
      index: 0,
      routes: [{ name: 'MainTabs' }],
    });
  };
  console.log(request);
  return (
    <SubLayout
      title="Xác nhận người giao hàng"
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1 bg-background-50">
        <View className="flex-1 px-6">
          {/* Header Icon - Only show when not scanned */}
          {!shipperId && !shipperInfo && (
            <View
              className="items-center"
              style={{ marginTop: (20 * height) / 812 }}
            >
              <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center">
                <Icon name="user" size={40} color="#e85a4f" />
              </View>
            </View>
          )}

          {/* Success Card - Show after scanning */}
          {shipperId ? (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border-2 border-red-200 ">
              <View className="items-center">
                {/* Shipper Info Card */}
                <View className="flex-row bg-primary-100 rounded-xl p-4 w-full mb-6 border-2 border-red-200">
                  <View className="items-center mr-4">
                    <AppAvatar
                      name={shipperInfo?.name}
                      uri={shipperInfo?.avatar}
                      size={70}
                      style={{
                        borderWidth: 3,
                        borderColor: '#fff',
                      }}
                    />
                  </View>

                  <View className="flex-1 justify-center">
                    <Text className="text-sm text-start text-white  mb-1">
                      Người giao hàng
                    </Text>
                    <Text className="text-base font-bold text-gray-900 mb-1">
                      {shipperInfo?.name || `Shipper ${shipperId}`}
                    </Text>
                    <Text className="text-sm text-start text-white  mb-1">
                      Biển số xe : {shipperInfo?.licensePlate}
                    </Text>
                  </View>
                </View>

                {/* Request/Product Info */}
                <View className="bg-gray-50 rounded-xl p-4 w-full mb-6 border-2 border-red-200">
                  <View className="flex-row justify-between">
                    <Text className="text-sm text-gray-500 font-semibold mb-3">
                      Thông tin đơn hàng
                    </Text>
                    {request && (
                      <Text className="text-sm text-gray-500 font-normal mb-3">
                        {request?.estimatedTime}
                      </Text>
                    )}
                  </View>

                  {request ? (
                    <View>
                      <Text className="text-sm font-semibold text-gray-900 mb-2">
                        {request?.itemName}
                      </Text>

                      {/* Product Images */}
                      {request?.pickUpItemImages &&
                        request?.pickUpItemImages.length > 0 && (
                          <View>
                            <ImageGalleryViewer
                              images={request.pickUpItemImages}
                              imageSize={120}
                              imageSpacing={12}
                              borderRadius={12}
                            />
                          </View>
                        )}

                      {/* Description */}
                      {request?.description && (
                        <Text className="text-sm text-gray-600 mb-2">
                          Mô tả: {request.description}
                        </Text>
                      )}
                    </View>
                  ) : (
                    <Text className="text-sm text-gray-500 text-center py-4">
                      Không có thông tin đơn hàng
                    </Text>
                  )}
                </View>
                {/* Bottom Button */}
                <View className="flex-row flex-1 justify-between gap-2">
                  <View style={{ width: '48%' }}>
                    <AppButton title="Từ chối " onPress={handleReject} />
                  </View>
                  <View style={{ width: '48%' }}>
                    <AppButton
                      title="Xác nhận "
                      onPress={handleConfirm}
                      color="#3366CC"
                    />
                  </View>
                </View>

                {/* Warning Message - Only show when not scanned */}
                {shipperId && (
                  <View className="bg-amber-50 rounded-xl p-4 border border-amber-200 mt-4">
                    <Text className="text-xs text-amber-800 text-center">
                      ⚠️ Vui lòng chỉ nhận hàng sau khi đã xác nhận đúng người
                      giao hàng
                    </Text>
                  </View>
                )}
              </View>
            </View>
          ) : (
            /* QR Scanner - Show when not scanned yet */
            <ScanQrComponent
              title="Xác nhận người giao hàng"
              subtitle="Quét mã QR của shipper để xác nhận danh tính"
              instruction="Khách hàng vui lòng xác nhận danh tính của người giao hàng trước khi thực hiện giao dịch"
              onScan={handleQRScan}
              onClose={() => {}}
            />
          )}
        </View>
      </ScrollView>
      <ImageModal
        visible={isModalVisible}
        imageUri={selectedImage}
        onClose={toggleModal}
      />
    </SubLayout>
  );
};

export default UserConfirmScreen;
