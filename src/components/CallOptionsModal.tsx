import React, { useEffect, useRef, useMemo } from 'react';
import {
  View,
  Text,
  Modal,
  Animated,
  Dimensions,
  Pressable,
  TouchableOpacity,
} from 'react-native';
import { maskPhone } from '../utils/validations/index';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';
// @ts-ignore
import { ZegoSendCallInvitationButton } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { Linking } from 'react-native';
import { callUser } from '../services/callService';

interface CallOptionsModalProps {
  visible: boolean;
  onClose: () => void;
  receiver: any;
  invitees: any[];
  user: any;
  senderName: string;
}

const CallOptionsModal: React.FC<CallOptionsModalProps> = ({
  visible,
  onClose,
  receiver,
  invitees,
  user,
  senderName,
}) => {
  const slideAnim = useRef(
    new Animated.Value(Dimensions.get('window').height),
  ).current;

  // Animate modal slide up/down
  useEffect(() => {
    if (visible) {
      Animated.timing(slideAnim, {
        toValue: 0,
        duration: 300,
        useNativeDriver: true,
      }).start();
    } else {
      Animated.timing(slideAnim, {
        toValue: Dimensions.get('window').height,
        duration: 300,
        useNativeDriver: true,
      }).start();
    }
  }, [visible]);

  const handlePhoneCall = async () => {
    onClose();
    const phoneNumber = receiver?.phone;
    if (!phoneNumber) {
      console.warn('⚠️ No phone number available');
      return;
    }
    console.log('📱 Initiating phone call to:', phoneNumber);
    try {
      const url = `tel:${phoneNumber}`;
      const supported = await Linking.canOpenURL(url);
      if (supported) {
        await Linking.openURL(url);
      } else {
        console.warn('Cannot open phone call');
      }
    } catch (e) {
      console.error('❌ Phone call failed:', e);
    }
  };

  return (
    <Modal
      visible={visible}
      transparent={true}
      animationType="none"
      onRequestClose={onClose}
    >
      <View style={{ flex: 1, justifyContent: 'flex-end' }}>
        <Pressable
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 0,
            left: 0,
            right: 0,
            bottom: 0,
            backgroundColor: 'rgba(0,0,0,0.5)',
          }}
        />

        <Animated.View
          style={{
            transform: [{ translateY: slideAnim }],
            backgroundColor: 'white',
            borderTopLeftRadius: 40,
            borderTopRightRadius: 40,
            paddingHorizontal: 20,
            paddingVertical: 20,
            paddingBottom: 40,
          }}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-xl font-bold text-gray-900 mr-2">
              Gọi đến
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon
                name="close"
                size={24}
                color="#000"
                className="p-1 bg-slate-100 rounded-full"
              />
            </TouchableOpacity>
          </View>

          <View className="flex-row items-center mb-4 text-end">
            <Text className="text-xl font-bold text-primary-100">
              {senderName}
            </Text>
          </View>

          <View className="flex-row gap-3 mb-4">
            {/* Zego Call Button */}
            <View className="flex-1 bg-blue-600 rounded-xl p-4 items-center">
              <ZegoSendCallInvitationButton
                invitees={invitees}
                isVideoCall={false}
                resourceID={'thugom'}
                timeout={120}
                onWillPressed={async () => {
                  console.log('📞 Call button will be pressed');
                  try {
                    await callUser(
                      String(user?.userId),
                      String(user?.name),
                      String(receiver?.userId),
                      `call_${Date.now()}`,
                      `room_${Date.now()}`,
                    );
                    return true;
                  } catch (e) {
                    return false;
                  } finally {
                    console.log('📞 Call button press handling completed');
                    return true;
                  }
                }}
              />
              <Text className="text-white font-semibold text-sm mt-2">
                Gọi bằng app
              </Text>
            </View>

            {/* Phone Call Button */}
            <TouchableOpacity
              onPress={handlePhoneCall}
              className="flex-1 bg-primary-100 rounded-xl p-4 items-center"
            >
              <Icon
                name="phone-classic"
                size={26}
                color="#e85a4f"
                className="bg-white rounded-full p-2"
              />
              <Text className="text-white font-semibold text-sm mt-2">
                Gọi SĐT
              </Text>
              <Text className="text-white text-xs mt-1">
                {maskPhone(receiver?.phone) || 'Không có SĐT'}
              </Text>
            </TouchableOpacity>
          </View>
        </Animated.View>
      </View>
    </Modal>
  );
};

export default CallOptionsModal;
