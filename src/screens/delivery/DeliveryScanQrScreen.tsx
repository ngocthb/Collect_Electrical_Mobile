import React, { useState, useEffect } from 'react';
import { View, Text, ScrollView, Image, Dimensions } from 'react-native';
import toast from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';
import routeService from '../../services/routeService';

import ScanQrComponent from '../../components/ScanQrComponent';
import AppButton from '../../components/ui/AppButton';
import AppAvatar from '../../components/ui/AppAvatar';
import ImageGalleryViewer from '../../components/ui/ImageGalleryViewer';
import SubLayout from '../../layout/SubLayout';
import { useSelector } from 'react-redux';
const { width, height } = Dimensions.get('window');
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

  console.log(request);
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
      routes: [{ name: 'MainTabs' }],
    });
  };

  return (
    <SubLayout
      title="Xác thực sản phẩm"
      onBackPress={() => navigation.goBack()}
      noScroll={true}
    >
      <View className="flex-1 bg-background-50">
        <View className="flex-1 px-6 pb-8">
          {!shipperId && (
            <View
              className="items-center"
              style={{ marginTop: (20 * height) / 812 }}
            >
              <View className="w-20 h-20 bg-red-50 rounded-full items-center justify-center ">
                <Icon name="box" size={40} color="#e85a4f" />
              </View>
            </View>
          )}

          {/* Status Card */}
          {shipperId ? (
            <View className="bg-white rounded-2xl p-6 mb-6 shadow-sm border-2 border-red-200 ">
              <View className="items-center">
                <View className=" justify-between  bg-primary-100  rounded-xl py-4 px-2 w-full mb-4 items-center gap-2 border-2 border-red-200">
                  <View className="flex-row  items-center  w-full">
                    <View className="w-1/3 items-center">
                      <View className="relative ">
                        <AppAvatar
                          name={senderInfo?.name}
                          uri={senderInfo.avatar}
                          size={70}
                          style={{
                            borderWidth: 3,
                            borderColor: '#fff',
                          }}
                        />
                      </View>
                    </View>
                    <View className="w-2/3 ">
                      <Text className="text-lg font-bold text-white text-start">
                        {senderInfo?.name}
                      </Text>
                      <Text className="text-sm text-white text-start mt-1">
                        {senderInfo?.email || '—'}
                      </Text>
                    </View>
                  </View>
                </View>
                <Text className="text-sm text-text-main mb-4">
                  Mã sản phẩm : {shipperId}
                </Text>
                {/* Items to be delivered (from request) */}
                <View className="bg-white rounded-lg w-full">
                  <View>
                    <Text className="text-text-main text-xs font-semibold uppercase tracking-wider mb-2">
                      {request?.subCategoryName} • {request?.brandName}
                    </Text>
                    <View className="mb-2">
                      <ImageGalleryViewer
                        images={(
                          request.pickUpItemImages ??
                          request.confirmImages ??
                          request.images ??
                          []
                        ).map((img: any) =>
                          typeof img === 'string' ? img : img?.uri || '',
                        )}
                        imageSize={140}
                        imageSpacing={8}
                        borderRadius={8}
                      />
                    </View>
                  </View>

                  <View>
                    <Text className="text-text-main text-xs font-semibold uppercase tracking-wider mb-2">
                      Ảnh xác nhận
                    </Text>
                    {imageUrl.length > 0 && (
                      <View className="mb-2">
                        <ImageGalleryViewer
                          images={imageUrl.map((img: any) =>
                            typeof img === 'string' ? img : img?.uri || '',
                          )}
                          imageSize={140}
                          imageSpacing={8}
                          borderRadius={8}
                        />
                      </View>
                    )}
                  </View>

                  <AppButton
                    title="Hoàn thành"
                    onPress={handleDone}
                    className="mb-4"
                  />
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
        </View>
      </View>
    </SubLayout>
  );
};

export default DeliveryScanQrScreen;
