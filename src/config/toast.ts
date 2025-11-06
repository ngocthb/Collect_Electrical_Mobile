import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';

const CustomSuccessToast = (props: any) =>
  React.createElement(BaseToast, {
    ...props,
    style: { borderLeftColor: '#10B981' },
    className:
      'border-l-4 bg-white rounded-xl min-h-[70px] p-2.5 mx-5 shadow-lg',
    contentContainerStyle: { paddingHorizontal: 5 },
    text1Style: { fontSize: 15, fontWeight: '600', color: '#111827' },
    text2Style: { fontSize: 14, color: '#6B7280', marginTop: 2 },
    renderLeadingIcon: () =>
      React.createElement(
        View,
        { className: 'justify-center items-center mr-2.5 w-10 h-10' },
        React.createElement(Icon, {
          name: 'check-circle',
          size: 24,
          color: '#10B981',
        }),
      ),
  });

const CustomErrorToast = (props: any) =>
  React.createElement(ErrorToast, {
    ...props,
    style: { borderLeftColor: '#EF4444' },
    className:
      'border-l-4 bg-white rounded-xl min-h-[70px] p-2.5 mx-5 shadow-lg',
    contentContainerStyle: { paddingHorizontal: 5 },
    text1Style: { fontSize: 15, fontWeight: '600', color: '#111827' },
    text2Style: { fontSize: 14, color: '#6B7280', marginTop: 2 },
    renderLeadingIcon: () =>
      React.createElement(
        View,
        { className: 'justify-center items-center mr-2.5 w-10 h-10' },
        React.createElement(Icon, {
          name: 'x-circle',
          size: 24,
          color: '#EF4444',
        }),
      ),
  });

const ConfirmToast = (internalState: any) => {
  const { text1, text2, props } = internalState;
  const { onCancel, onConfirm, button1, button2 } = props || {};

  return React.createElement(
    View,
    {
      style: { borderLeftColor: '#F59E0B' },
      className:
        'border-l-4 bg-white rounded-xl p-2.5 w-[90%] self-center shadow-lg',
    },
    React.createElement(
      View,
      { className: 'flex-row items-start' },
      React.createElement(
        View,
        { className: 'justify-center items-center mr-2.5 w-10 h-10' },
        React.createElement(Icon, {
          name: 'alert-triangle',
          size: 24,
          color: '#F59E0B',
        }),
      ),
      React.createElement(
        View,
        { className: 'flex-1' },
        React.createElement(
          Text,
          { className: 'text-base font-semibold text-gray-800' },
          text1,
        ),
        text2
          ? React.createElement(
              Text,
              { className: 'text-sm text-gray-500 mt-0.5' },
              text2,
            )
          : null,
        React.createElement(
          View,
          { className: 'flex-row justify-end mt-2 gap-2.5' },
          React.createElement(
            TouchableOpacity,
            {
              onPress: onCancel,
              className: 'py-1.5 px-3.5 bg-gray-200 rounded-lg',
            },
            React.createElement(
              Text,
              { className: 'text-gray-800 font-medium' },
              button1,
            ),
          ),
          React.createElement(
            TouchableOpacity,
            {
              onPress: onConfirm,
              className: 'py-1.5 px-3.5 bg-red-500 rounded-lg',
            },
            React.createElement(
              Text,
              { className: 'text-white font-semibold' },
              button2,
            ),
          ),
        ),
      ),
    ),
  );
};

const toastConfig = {
  success: (props: any) => React.createElement(CustomSuccessToast, props),
  error: (props: any) => React.createElement(CustomErrorToast, props),
  confirm: (props: any) => React.createElement(ConfirmToast, props),
};

export default toastConfig;
