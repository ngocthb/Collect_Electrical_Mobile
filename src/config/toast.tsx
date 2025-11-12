import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';

const baseToastStyle = {
  borderLeftWidth: 5,
  backgroundColor: '#fff',
  borderRadius: 12,
  minHeight: 60,
  padding: 8,
  marginHorizontal: 10,
  elevation: 4,
  shadowColor: '#000',
  shadowOffset: {
    width: 0,
    height: 2,
  },
  shadowOpacity: 0.25,
  shadowRadius: 3.84,
};

const text1Style = {
  fontSize: 12,
  fontWeight: '600',
  color: '#111827',
};

const text2Style = {
  fontSize: 10,
  color: '#6B7280',
  marginTop: 2,
};

const CustomSuccessToast = (props: any) => (
  <BaseToast
    {...props}
    style={[baseToastStyle, { borderLeftColor: '#10B981' }]}
    contentContainerStyle={{ paddingHorizontal: 5 }}
    text1Style={text1Style}
    text2Style={text2Style}
  />
);

const CustomErrorToast = (props: any) => (
  <ErrorToast
    {...props}
    style={[baseToastStyle, { borderLeftColor: '#EF4444' }]}
    contentContainerStyle={{ paddingHorizontal: 12 }}
    text1Style={text1Style}
    text2Style={text2Style}
  />
);

const CustomInfoToast = (props: any) => (
  <BaseToast
    {...props}
    style={[baseToastStyle, { borderLeftColor: '#3B82F6' }]}
    contentContainerStyle={{ paddingHorizontal: 12 }}
    text1Style={text1Style}
    text2Style={text2Style}
  />
);

const CustomWarningToast = (props: any) => (
  <BaseToast
    {...props}
    style={[baseToastStyle, { borderLeftColor: '#F59E0B' }]}
    contentContainerStyle={{ paddingHorizontal: 12 }}
    text1Style={text1Style}
    text2Style={text2Style}
  />
);

const ConfirmToast = (internalState: any) => {
  const { text1, text2, props } = internalState;
  const {
    onCancel,
    onConfirm,
    button1 = 'Hủy',
    button2 = 'Xác nhận',
  } = props || {};

  return (
    <View className="bg-white rounded-2xl p-5 w-[90%] self-center shadow-2xl">
      <View className="flex-1">
        <Text className="text-lg font-bold text-gray-900 mb-1">
          {text1 || 'Xác nhận'}
        </Text>
        {text2 ? (
          <Text className="text-sm text-gray-600 leading-5">{text2}</Text>
        ) : null}
      </View>

      <View className="flex-row justify-end mt-5 gap-3">
        <TouchableOpacity
          onPress={onCancel}
          className="py-2.5 px-6 bg-gray-100 rounded-xl active:bg-gray-200"
          activeOpacity={0.7}
        >
          <Text className="text-gray-700 font-semibold text-base">
            {button1}
          </Text>
        </TouchableOpacity>
        <TouchableOpacity
          onPress={onConfirm}
          className="py-2.5 px-6 bg-red-500 rounded-xl active:bg-red-600"
          activeOpacity={0.8}
        >
          <Text className="text-white font-bold text-base">{button2}</Text>
        </TouchableOpacity>
      </View>
    </View>
  );
};

const toastConfig = {
  success: (props: any) => <CustomSuccessToast {...props} />,
  error: (props: any) => <CustomErrorToast {...props} />,
  info: (props: any) => <CustomInfoToast {...props} />,
  warning: (props: any) => <CustomWarningToast {...props} />,
  confirm: (props: any) => <ConfirmToast {...props} />,
};

export default toastConfig;
