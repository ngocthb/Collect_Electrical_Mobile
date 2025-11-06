import React from 'react';
import { View, Text, TouchableOpacity, StyleSheet } from 'react-native';
import { BaseToast, ErrorToast } from 'react-native-toast-message';
import Icon from 'react-native-vector-icons/Feather';

const CustomSuccessToast = (props: any) =>
  React.createElement(BaseToast, {
    ...props,
    style: [styles.successContainer, { borderLeftColor: '#10B981' }],
    contentContainerStyle: { paddingHorizontal: 15 },
    text1Style: styles.text1,
    text2Style: styles.text2,
    renderLeadingIcon: () =>
      React.createElement(
        View,
        { style: styles.iconContainer },
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
    style: [styles.errorContainer, { borderLeftColor: '#EF4444' }],
    contentContainerStyle: { paddingHorizontal: 15 },
    text1Style: styles.text1,
    text2Style: styles.text2,
    renderLeadingIcon: () =>
      React.createElement(
        View,
        { style: styles.iconContainer },
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
    { style: styles.confirmContainer },
    React.createElement(
      View,
      { style: styles.confirmContent },
      React.createElement(
        View,
        { style: styles.iconContainer },
        React.createElement(Icon, {
          name: 'alert-triangle',
          size: 24,
          color: '#F59E0B',
        }),
      ),
      React.createElement(
        View,
        { style: styles.textContainer },
        React.createElement(Text, { style: styles.confirmText1 }, text1),
        text2
          ? React.createElement(Text, { style: styles.confirmText2 }, text2)
          : null,
        React.createElement(
          View,
          { style: styles.buttonContainer },
          React.createElement(
            TouchableOpacity,
            { onPress: onCancel, style: styles.cancelButton },
            React.createElement(
              Text,
              { style: styles.cancelButtonText },
              button1,
            ),
          ),
          React.createElement(
            TouchableOpacity,
            { onPress: onConfirm, style: styles.confirmButton },
            React.createElement(
              Text,
              { style: styles.confirmButtonText },
              button2,
            ),
          ),
        ),
      ),
    ),
  );
};

const styles = StyleSheet.create({
  successContainer: {
    borderLeftWidth: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    minHeight: 70,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  errorContainer: {
    borderLeftWidth: 4,
    backgroundColor: 'white',
    borderRadius: 12,
    minHeight: 70,
    paddingHorizontal: 10,
    marginHorizontal: 20,
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmContainer: {
    borderLeftWidth: 4,
    borderLeftColor: '#F59E0B',
    backgroundColor: 'white',
    borderRadius: 12,
    paddingHorizontal: 10,
    width: '90%',
    alignSelf: 'center',
    shadowColor: '#000',
    shadowOffset: { width: 0, height: 2 },
    shadowOpacity: 0.1,
    shadowRadius: 8,
    elevation: 5,
  },
  confirmContent: {
    flexDirection: 'row',
    alignItems: 'flex-start',
    paddingVertical: 15,
  },
  iconContainer: {
    justifyContent: 'center',
    alignItems: 'center',
    marginRight: 10,
    width: 40,
    height: 40,
  },
  textContainer: {
    flex: 1,
  },
  text1: {
    fontSize: 15,
    fontWeight: '600',
    color: '#111827',
  },
  text2: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  confirmText1: {
    fontSize: 16,
    fontWeight: '600',
    color: '#111827',
  },
  confirmText2: {
    fontSize: 14,
    color: '#6B7280',
    marginTop: 2,
  },
  buttonContainer: {
    flexDirection: 'row',
    justifyContent: 'flex-end',
    marginTop: 10,
    gap: 10,
  },
  cancelButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#E5E7EB',
    borderRadius: 8,
  },
  cancelButtonText: {
    color: '#374151',
    fontWeight: '500',
  },
  confirmButton: {
    paddingVertical: 6,
    paddingHorizontal: 14,
    backgroundColor: '#EF4444',
    borderRadius: 8,
  },
  confirmButtonText: {
    color: 'white',
    fontWeight: '600',
  },
});

const toastConfig = {
  success: (props: any) => React.createElement(CustomSuccessToast, props),
  error: (props: any) => React.createElement(CustomErrorToast, props),
  confirm: (props: any) => React.createElement(ConfirmToast, props),
};

export default toastConfig;
