import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
// @ts-ignore
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import { NativeEventEmitter, NativeModules } from 'react-native';
import Config from './env';
import { navigationRef } from '../navigation/navigationService';
import { endCall } from '../services/callService';
import {Platform } from 'react-native';
const { CallModule } = NativeModules;

const APP_ID = Config.ZEGO_APP_ID;
const APP_SIGN = Config.ZEGO_APP_SIGN;

let isInitialized = false;
let currentUserId: string | null = null;
let callEndedSub: any = null;
let currentCallId: string | null = null;
let currentCalleeId: string | null = null;
let callStartTime: number | null = null;

//
// ================= SET CURRENT CALL INFO =================
//
export const setCurrentCallInfo = (callId: string, calleeId: string) => {
  currentCallId = callId;
  currentCalleeId = calleeId;
  callStartTime = Date.now();
  console.log('[Zego] 📞 Call started:', {
    callId,
    calleeId,
    startTime: callStartTime,
  });
};

//
// ================= CLEAR CURRENT CALL INFO =================
//
export const clearCurrentCallInfo = () => {
  const duration = callStartTime ? (Date.now() - callStartTime) / 1000 : 0;
  console.log('[Zego] 📵 Call ended:', {
    currentCallId,
    currentCalleeId,
    duration: `${duration}s`,
  });
  currentCallId = null;
  currentCalleeId = null;
  callStartTime = null;
};

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
    currentCallId = null;
    currentCalleeId = null;

    console.log('[Zego] Uninit completed ✅');
  } catch (error) {
    console.error('[Zego] Uninit error:', error);

    isInitialized = false;
    currentUserId = null;
    currentCallId = null;
    currentCalleeId = null;
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
      ...(Platform.OS === 'ios' && {
    requireConfig: () => ({
      onCallEnd: () => {
        console.log('📴 Zego ended → end CallKit');
        CallModule.endCallKit();
        if (navigationRef.isReady()) {
      navigationRef.reset({
        index: 0,
        routes: [{ name: 'MainTabs' }],
      });
    }

      },
    }),
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
      },
    );

    //
    // ================= LISTENER =================
    //
    // ✅ tránh duplicate listener
   if (Platform.OS === 'ios' ) { if (callEndedSub) {
      callEndedSub.remove();
      callEndedSub = null;
    }
console.log("1111111")
    const emitter = new NativeEventEmitter(CallModule);

    callEndedSub = emitter.addListener('CALL_ENDED', async event => {
      const duration = event?.duration ?? 0;

      console.log('📴 Native CALL_ENDED:', {
        duration,
        currentCallId,
        currentCalleeId,
      });

      // 👉 Call endCall API if we have call info
      if (currentCallId && currentCalleeId && currentUserId) {
        try {
          console.log('[Zego] Calling endCall API:', {
            currentCallId,
            currentCalleeId,
          });
          const response = await endCall(currentCallId, currentCalleeId);
          console.log('[Zego] ✅ endCall API response:', response);
        } catch (err) {
          console.error('[Zego] ❌ endCall API error:', err);
        }
      } else {
        console.log('[Zego] ⏭️ Skipping endCall API - missing call info');
      }

      onCallEnd && onCallEnd(duration);

      if (isInitialized) {
        try {
          ZegoUIKitPrebuiltCallService.hangUp();
          console.log('[Zego] Hung up call from CALL_ENDED event');
          clearCurrentCallInfo();
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
    });}

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
