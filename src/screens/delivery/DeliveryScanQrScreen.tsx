import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image } from 'react-native';
import toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';
import routeService from '../../services/routeService';
import { maskPhone } from '../../utils/validations';
import ScanQrComponent from '../../components/ScanQrComponent';
import AppButton from '../../components/ui/AppButton';
import AppAvatar from '../../components/ui/AppAvatar';
import SubLayout from '../../layout/SubLayout';
import { useSelector } from 'react-redux';

interface DeliveryScanQrScreenProps {
  navigation: any;
  route: any;
}

const DeliveryScanQrScreen = ({
  navigation,
  route,
}: DeliveryScanQrScreenProps) => {
  const [shipperId, setShipperId] = useState<string | null>(null);

  const [showScanner, setShowScanner] = useState(true);
  const imageUrl: string[] = useSelector(
    (state: any) => state.deliveryConfirmImage.imageUrls,
  );
  const routeRaw = route.params?.requestId;
  const resolvedRequestId =
    typeof routeRaw === 'object' && routeRaw != null
      ? routeRaw?.id ?? routeRaw
      : routeRaw;

  const [request, setRequest] = useState<any>();
  const [senderInfo, setSenderInfo] = useState<any | null>(null);

  useEffect(() => {
    let mounted = true;

    (async () => {
      try {
        const response = await routeService.getDetail(
          String(resolvedRequestId),
        );
        const r: any = response;
        if (!mounted) return;
        if (r) {
          setRequest(r);

          if (r.sender) {
            setSenderInfo(r.sender);
          }
        }
      } catch (e) {
        console.warn('DeliveryScanQr: failed to load request by id', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, [route.params]);

  useEffect(() => {
    const candidateSender =
      route.params?.request?.sender ??
      route.params?.sender ??
      routeRaw?.sender ??
      null;
    if (candidateSender) setSenderInfo(candidateSender);
  }, [route.params, routeRaw]);

  useEffect(() => {
    if (shipperId && !senderInfo) {
      const candidateSender =
        route.params?.request?.sender ??
        route.params?.sender ??
        routeRaw?.sender ??
        null;
      if (candidateSender) setSenderInfo(candidateSender);
    }
  }, [shipperId, senderInfo, route.params, routeRaw]);

  const handleScanSuccess = (id: string) => {
    setShipperId(id);
    setShowScanner(false);

    (async () => {
      try {
        const detail = await routeService.getDetail(String(id));
        const detailData: any = detail;

        if (detailData) {
          setRequest(detailData);
          if (detailData.sender) setSenderInfo(detailData.sender);
        }
      } catch (e) {
        console.warn('Failed to load detail for scanned code', e);
      }
    })();
  };

  const handleScanClose = () => {
    toast.show({
      type: 'confirm',
      text1: 'Hủy quét mã?',
      text2: 'Bạn có muốn quay lại trang trước không?',
      autoHide: false,
      props: {
        button1: 'Tiếp tục quét',
        button2: 'Quay lại',
        onCancel: () => {
          toast.hide();
        },
        onConfirm: () => {
          toast.hide();
          navigation.goBack();
        },
      },
    });
  };

  const handleDone = async () => {
    await routeService.confirmRoute(String(resolvedRequestId), {
      qrCode: shipperId || '',
      confirmImages: imageUrl,
    });
    toast.show({
      type: 'success',
      text1: 'Hoàn thành',
      text2: 'Xác thực sản phẩm thành công!',
    });
    navigation.reset({
      index: 0,
      routes: [{ name: 'DeliveryOrder' }],
    });
  };

  return (
    <SubLayout
      title="Xác thực sản phẩm"
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1 bg-gray-50">
        <View className="flex-1 px-6  pb-8">
          {!shipperId && (
            <View className="items-center pt-12">
              <View className="w-20 h-20 bg-blue-100 rounded-full items-center justify-center ">
                <Icon name="box" size={40} color="#3B82F6" />
              </View>
            </View>
          )}

          {/* Status Card */}
          {shipperId ? (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border border-green-100 mt-10">
              <View className="items-center">
                <View className="w-16 h-16 bg-green-100 rounded-full items-center justify-center mb-4">
                  <Icon name="check-circle" size={32} color="#10B981" />
                </View>
                <Text className="text-xl font-bold text-green-600 mb-2">
                  Xác thực thành công!
                </Text>
                <Text className="text-sm text-gray-500 mb-4">
                  Sản phẩm đã được hệ thống ghi nhận
                </Text>
                <Text className="text-sm text-text-main mb-4">
                  Mã sản phẩm : {shipperId}
                </Text>
                <View className=" justify-between  bg-gray-50 rounded-xl py-4 px-2 w-full mb-4 items-center gap-2">
                  <View className="flex-row  items-center  w-full">
                    <View className="w-1/3 items-center">
                      {senderInfo?.avatar ? (
                        <Image
                          source={{ uri: senderInfo.avatar }}
                          className="w-20 h-20 rounded-full"
                          style={{
                            shadowColor: '#3B82F6',
                            shadowOffset: { width: 0, height: 4 },
                            shadowOpacity: 0.3,
                            shadowRadius: 8,
                          }}
                          resizeMode="cover"
                        />
                      ) : (
                        <AppAvatar name={senderInfo?.name} size={70} />
                      )}
                    </View>
                    <View className="w-2/3 ">
                      <Text className="text-sm text-start text-gray-600  mb-1">
                        Người gửi hàng
                      </Text>
                      <Text className="text-lg font-bold text-gray-900 text-start">
                        {senderInfo?.name}
                      </Text>
                      <Text className="text-sm text-gray-500 text-start mt-1">
                        SĐT: {maskPhone(senderInfo?.phone) || '—'}
                      </Text>
                    </View>
                  </View>
                  {senderInfo?.address && (
                    <Text
                      className="text-sm flex-1 text-gray-500 text-start mt-1"
                      numberOfLines={3}
                      ellipsizeMode="tail"
                    >
                      Đ/c: {senderInfo.address}
                    </Text>
                  )}
                </View>

                {/* Items to be delivered (from request) */}
                <View className="bg-white rounded-lg w-full">
                  {request ? (
                    <View>
                      <Text className="text-sm text-gray-500 mb-2">
                        {request.itemName ?? request.name}
                      </Text>
                      {(request.pickUpItemImages ||
                        request.confirmImages ||
                        request.images) && (
                        <ScrollView
                          horizontal
                          showsHorizontalScrollIndicator={false}
                          className="mb-2"
                        >
                          {(
                            request.pickUpItemImages ??
                            request.confirmImages ??
                            request.images
                          ).map((img: any, idx: number) => (
                            <Image
                              key={idx}
                              source={
                                typeof img === 'string'
                                  ? { uri: img }
                                  : img && img.uri
                                  ? { uri: img.uri }
                                  : img
                              }
                              style={{
                                width: 120,
                                height: 80,
                                borderRadius: 8,
                                marginRight: 8,
                              }}
                            />
                          ))}
                        </ScrollView>
                      )}
                    </View>
                  ) : (
                    <Text className="text-sm text-gray-600">
                      Không có thông tin đơn hàng
                    </Text>
                  )}

                  <View>
                    <Text className="text-base font-semibold mb-2">
                      Ảnh xác nhận
                    </Text>
                    {imageUrl.length > 0 && (
                      <ScrollView
                        horizontal
                        showsHorizontalScrollIndicator={false}
                        className="mb-2"
                      >
                        {imageUrl.map((img: any, idx: number) => (
                          <Image
                            key={idx}
                            source={
                              typeof img === 'string'
                                ? { uri: img }
                                : img && img.uri
                                ? { uri: img.uri }
                                : img
                            }
                            style={{
                              width: 120,
                              height: 80,
                              borderRadius: 8,
                              marginRight: 8,
                            }}
                          />
                        ))}
                      </ScrollView>
                    )}
                  </View>
                </View>
              </View>
            </View>
          ) : (
            <>
              {showScanner && (
                <ScanQrComponent
                  title=" Xác thực sản phẩm"
                  subtitle="Quét mã QR đã dán trên sản phẩm để xác thực"
                  instruction="Nhân viên vui lòng quét mã QR trên sản phẩm để xác thực trước khi chuyển hàng về kho"
                  onScan={handleScanSuccess}
                  onClose={handleScanClose}
                />
              )}
            </>
          )}

          {/* Complete Button */}
          <AppButton title="Hoàn thành" onPress={handleDone} className="mb-4" />

          {/* Additional Info */}
          {!shipperId && (
            <View className="bg-amber-50 rounded-xl p-4 border border-amber-200">
              <Text className="text-sm text-amber-800 text-center">
                ⚠️ Vui lòng chỉ nhận hàng sau khi đã xác nhận đúng người giao
                hàng
              </Text>
            </View>
          )}
        </View>
      </ScrollView>
    </SubLayout>
  );
};

export default DeliveryScanQrScreen;
