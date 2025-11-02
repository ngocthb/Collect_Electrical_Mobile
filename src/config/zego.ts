import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
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
      // ✅ Hangup any ongoing calls before uninit
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
    // ✅ Check if already initialized for THIS user
    if (isInitialized && currentUserId === userId) {
      console.log('[Zego] Already initialized for user:', userId);
      return;
    }

    // ✅ If initialized for a DIFFERENT user, uninit first
    if (isInitialized && currentUserId !== userId) {
      await uninitZegoService();
    }

    await ZegoUIKitPrebuiltCallService.init(
      APP_ID,
      APP_SIGN,
      userId,
      userName,
      [ZIM, ZPNs],
      {
        ringtoneConfig: {
          incomingCallFileName: 'zego_incoming.wav',
          outgoingCallFileName: 'zego_incoming.wav',
        },
        notifyWhenAppRunningInBackgroundOrQuit: false, // ✅ Tắt auto-show khi app background
        isIOSSandboxEnvironment: false,
        androidNotificationConfig: {
          channelID: 'thu_gom',
          channelName: 'thu_gom',
        },
        innerText: {
          incomingCallPageDeclineButton: 'Từ chối',
          incomingCallPageAcceptButton: 'Chấp nhận',
        },
        requireConfig: (data: any) => {
          console.log('[Zego] requireConfig called:', data);
          return {
            onHangUp: (duration: number) => {
              console.log('[Zego] Call ended:', duration);
              onCallEnd?.(duration);
            },
          };
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
