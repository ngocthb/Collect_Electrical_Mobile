import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
// @ts-ignore
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import messaging from '@react-native-firebase/messaging';
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
        ringtoneConfig: {
          incomingCallFileName: 'zego_incoming.wav',
          outgoingCallFileName: 'zego_incoming.wav',
        },
        notifyWhenAppRunningInBackgroundOrQuit: true,
        isIOSSandboxEnvironment: false,
        androidNotificationConfig: {
          channelID: 'thu_gom',
          channelName: 'thu_gom',
        },
        // ✅ QUAN TRỌNG: Cấu hình offline push
        requireConfig: (callInvitationData: any) => {
          console.log('[Zego] requireConfig called:', callInvitationData);
          return {
            // ✅ KEY 1: Phải set false để nhận push khi app killed
            onlineOnly: false,

            // ✅ KEY 2: Resource ID từ Zego Console
            resourceID: 'zego_call', // ⚠️ Thay bằng resource ID thật của bạn

            onHangUp: (duration: number) => {
              console.log('[Zego] Call ended:', duration);
              onCallEnd?.(duration);
            },
          };
        },
      },
    ).then(() => {
      ZegoUIKitPrebuiltCallService.requestSystemAlertWindow({
        message:
          'We need your consent for the following permissions in order to use the offline call function properly',
        allow: 'Allow',
        deny: 'Deny',
      });
    });

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

// ✅ Setup notification handlers
export const setupZegoNotificationHandlers = () => {
  // Foreground notification
  const unsubscribe = messaging().onMessage(async remoteMessage => {
    console.log('[Zego] Foreground notification:', remoteMessage);
    // Zego sẽ tự động handle
  });

  // Background/Quit notification tap
  messaging().onNotificationOpenedApp(remoteMessage => {
    console.log('[Zego] Notification opened app:', remoteMessage);
  });

  // Killed state notification tap
  messaging()
    .getInitialNotification()
    .then(remoteMessage => {
      if (remoteMessage) {
        console.log('[Zego] App opened from killed state:', remoteMessage);
      }
    });

  return unsubscribe;
};
