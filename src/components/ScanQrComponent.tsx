import React, { useState } from 'react';
import { View, Text } from 'react-native';
import { Camera, CameraType } from 'react-native-camera-kit';

import AppButton from './ui/AppButton';

interface ScanQrComponentProps {
  onClose: () => void;
  onScan: (id: string) => void;
  title?: string;
  subtitle?: string;
  instruction?: string;
}

const ScanQrComponent: React.FC<ScanQrComponentProps> = ({
  onClose,
  onScan,
  title = 'Quét mã QR của sản phẩm',
  subtitle = 'Đưa camera vào mã QR để định danh sản phẩm',
  instruction = 'Hướng camera vào mã QR của sản phẩm để quét và xác nhận thông tin sản phẩm',
}) => {
  const [scanned, setScanned] = useState(false);
  const [qrId, setQrId] = useState<string | null>(null);

  const handleBarCodeRead = (event: any) => {
    if (!scanned && event.nativeEvent.codeStringValue) {
      const code = event.nativeEvent.codeStringValue;
      setScanned(true);
      setQrId(code);
      setTimeout(() => {
        onScan(code);
      }, 500);
    }
  };

  const handleScanAgain = () => {
    setScanned(false);
    setQrId(null);
  };

  return (
    <View className="flex-1 bg-gray-50 px-4 pt-8 items-center h-screen">
      <Text className="text-xl font-bold mb-2 text-primary-700 text-center">
        {title}
      </Text>
      <Text className="text-sm text-gray-500 mb-4 text-center">{subtitle}</Text>

      <View className="w-72 h-72 rounded-xl overflow-hidden bg-black items-center justify-center shadow-lg mb-6">
        {!scanned ? (
          <>
            <Camera
              style={{
                position: 'absolute',
                top: 0,
                left: 0,
                right: 0,
                bottom: 0,
              }}
              cameraType={CameraType.Back}
              scanBarcode={true}
              onReadCode={handleBarCodeRead}
              showFrame={false}
            />
            {/* Overlay với khung quét */}
            <View
              style={{
                position: 'absolute',
                width: 220,
                height: 220,
                zIndex: 1,
              }}
            >
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  left: 0,
                  width: 40,
                  height: 40,
                  borderTopWidth: 4,
                  borderLeftWidth: 4,
                  borderColor: '#10B981',
                  borderTopLeftRadius: 4,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  top: 0,
                  right: 0,
                  width: 40,
                  height: 40,
                  borderTopWidth: 4,
                  borderRightWidth: 4,
                  borderColor: '#10B981',
                  borderTopRightRadius: 4,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  left: 0,
                  width: 40,
                  height: 40,
                  borderBottomWidth: 4,
                  borderLeftWidth: 4,
                  borderColor: '#10B981',
                  borderBottomLeftRadius: 4,
                }}
              />
              <View
                style={{
                  position: 'absolute',
                  bottom: 0,
                  right: 0,
                  width: 40,
                  height: 40,
                  borderBottomWidth: 4,
                  borderRightWidth: 4,
                  borderColor: '#10B981',
                  borderBottomRightRadius: 4,
                }}
              />
            </View>
          </>
        ) : (
          <View className="flex-1 items-center justify-center bg-white p-4 w-full">
            <Text className="text-5xl text-green-500 mb-2">✓</Text>
            <Text className="text-lg font-semibold text-green-600 mb-2">
              Quét thành công!
            </Text>
            <Text className="text-base font-medium mb-4 text-gray-700">
              Mã QR: {qrId}
            </Text>
            <AppButton title="Quét lại" onPress={handleScanAgain} />
          </View>
        )}
      </View>

      <View className="mt-2 bg-blue-50 px-4 py-3 rounded-lg border border-blue-200">
        <Text className="text-xs text-blue-700 text-center">{instruction}</Text>
      </View>
    </View>
  );
};

export default ScanQrComponent;
