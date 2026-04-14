import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
// @ts-ignore
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';

import Config from './env';

const APP_ID = Config.ZEGO_APP_ID;
const APP_SIGN = Config.ZEGO_APP_SIGN;

let isInitialized = false;
let currentUserId: string | null = null;
let initPromise: Promise<void> | null = null;

export const uninitZegoService = async (): Promise<void> => {
  try {
    console.log('[Zego] Uninitializing...');

    if (isInitialized) {
      try {
        await ZegoUIKitPrebuiltCallService.hangUp();
        console.log('[Zego] Hung up all calls');
      } catch (e) {
        console.log('[Zego] No active call to hang up');
      }

      await ZegoUIKitPrebuiltCallService.uninit();
      isInitialized = false;
      currentUserId = null;
      initPromise = null;
      console.log('[Zego] Uninit completed ✅');
    }
  } catch (error) {
    console.error('[Zego] Uninit error:', error);
    isInitialized = false;
    currentUserId = null;
    initPromise = null;
  }
};

export const initZegoService = async (
  userId: string,
  userName: string,
  avatarUrl: string,
  onCallEnd?: (duration: number) => void,
) => {
  try {
    // Check if already initialized for THIS user
    if (isInitialized && currentUserId === userId) {
      console.log('[Zego] Already initialized for user:', userId);
      return;
    }

    // If initialized for a DIFFERENT user, uninit first
    if (isInitialized && currentUserId !== userId) {
      await uninitZegoService();
    }

    await ZegoUIKitPrebuiltCallService.init(
      APP_ID,
      APP_SIGN,
      userId,
      userName,
      [ZIM, ZPNs], // ✅ ZPNs sẽ tự động enable offline push
      {
        resouceID: "thugom",
        ringtoneConfig: {
          incomingCallFileName: 'zego_incoming.mp3',
          outgoingCallFileName: 'zego_incoming.mp3',
        },
        enableLog: true,
        notifyWhenAppRunningInBackgroundOrQuit: true,
        isIOSSandboxEnvironment: true,
        iOSOfflinePushConfig: {
    pushID: 'thugom', // cái bạn set trên Zego Console
  },
        androidNotificationConfig: {
          channelID: 'ZegoUIKit',
          channelName: 'ZegoUIKit',
        },
      },
    );



    isInitialized = true;
    currentUserId = userId;
    console.log('[Zego] Service initialized ✅');
  } catch (error) {
    console.error('[Zego] Init failed ❌:', error);
    isInitialized = false;
    currentUserId = null;
    throw error;
  }
};
