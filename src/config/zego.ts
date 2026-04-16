import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
// @ts-ignore
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { NativeEventEmitter, NativeModules } from 'react-native';
import Config from './env';
import { navigationRef } from '../navigation/navigationService';
const { CallModule } = NativeModules;

const APP_ID = Config.ZEGO_APP_ID;
const APP_SIGN = Config.ZEGO_APP_SIGN;

let isInitialized = false;
let currentUserId: string | null = null;
let callEndedSub: any = null;

//
// ================= UNINIT =================
//
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
    }

    // ✅ remove listener
    if (callEndedSub) {
      callEndedSub.remove();
      callEndedSub = null;
    }

    isInitialized = false;
    currentUserId = null;

    console.log('[Zego] Uninit completed ✅');
  } catch (error) {
    console.error('[Zego] Uninit error:', error);

    isInitialized = false;
    currentUserId = null;
    callEndedSub = null;
  }
};

//
// ================= INIT =================
//
export const initZegoService = async (
  userId: string,
  userName: string,
  avatarUrl: string,
  onCallEnd?: (duration: number) => void,
) => {
  try {
    // ✅ tránh init lại cùng user
    if (isInitialized && currentUserId === userId) {
      console.log('[Zego] Already initialized for user:', userId);
      return;
    }

    // ✅ nếu user khác → reset
    if (isInitialized && currentUserId !== userId) {
      await uninitZegoService();
    }

    //
    // ================= INIT ZEGO =================
    //
    await ZegoUIKitPrebuiltCallService.init(
      APP_ID,
      APP_SIGN,
      userId,
      userName,
      [ZIM, ZPNs],
      {
        requireConfig: () => ({
          onCallEnd: () => {
            console.log('📴 Zego ended → end CallKit');
            CallModule.endCallKit();
          },
        }),

        resourceID: 'thugom',

        ringtoneConfig: {
          incomingCallFileName: 'zego_incoming.mp3',
          outgoingCallFileName: 'zego_incoming.mp3',
        },

        enableLog: true,
        notifyWhenAppRunningInBackgroundOrQuit: true,
        isIOSSandboxEnvironment: true,

        androidNotificationConfig: {
          channelID: 'ZegoUIKit',
          channelName: 'ZegoUIKit',
        },
      }
    );

    //
    // ================= LISTENER =================
    //
    // ✅ tránh duplicate listener
    if (callEndedSub) {
      callEndedSub.remove();
      callEndedSub = null;
    }

    const emitter = new NativeEventEmitter(CallModule);

    callEndedSub = emitter.addListener('CALL_ENDED', (event) => {
  const duration = event?.duration ?? 0;

  console.log('📴 Native CALL_ENDED:', duration);

  onCallEnd && onCallEnd(duration);

  if (isInitialized) {
    try {
      ZegoUIKitPrebuiltCallService.hangUp();
      console.log('[Zego] Hung up call from CALL_ENDED event');
      if (navigationRef.isReady()) {
  navigationRef.reset({
  index: 0,
  routes: [
    {
      name: 'MainTabs',
    },
  ],
});
  }

    } catch (e) {
      console.log('[Zego] hangUp skipped');
    }
  }
});

    //
    // ================= DONE =================
    //
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