import { useEffect } from 'react';
import { NativeModules } from 'react-native';
import { navigationRef } from '../navigation/navigationService';
import { useSelector } from 'react-redux';

//@ts-ignore
import { ZegoUIKitPrebuiltCallService } from '@zegocloud/zego-uikit-prebuilt-call-rn';

const { CallModule } = NativeModules;

export const useVoipCallHandler = () => {
  const [user] = useSelector((state: any) => [state.auth.user]);
  useEffect(() => {
    const checkCall = async () => {
      const hasCall = await CallModule.getItem('HAS_PENDING_CALL');

      console.log('HAS_PENDING_CALL:', hasCall);

      if (!hasCall) return;

      const roomID = await CallModule.getItem('PENDING_ROOM_ID');
      const callerName = await CallModule.getItem('PENDING_CALLER_NAME');
      const callerId = await CallModule.getItem('PENDING_CALLER_ID');
      const callId = await CallModule.getItem('PENDING_CALL_ID');
      console.log('📞 Resume call:', roomID);

      if (!roomID) return;
      const cleanUserIdForZego = (userId: string) => {
        return userId.replace(/[^a-zA-Z0-9_]/g, '');
      };

      const tryNavigate = async () => {
        if (navigationRef.isReady()) {
          console.log('✅ Navigation ready → navigate');
          console.log(
            'Navigating to ZegoUIKitPrebuiltCallInCallScreen with roomID:',
            roomID,
            'callerName:',
            callerName,
            'callerId:',
            callerId,
          );
          // navigationRef.navigate('ZegoUIKitPrebuiltCallInCallScreen', {
          //   invitees: [
          //     {
          //       userID: cleanUserIdForZego(String(callerId)),
          //       userName: String(callerName),
          //     },
          //   ],
          //   callID: callId,
          //   roomID: roomID,
          //   userID: cleanUserIdForZego(String(user?.userId)),
          //   userName: String(user?.name),
          // });
          ZegoUIKitPrebuiltCallService.joinCall({
            callID: callId,
            userID: cleanUserIdForZego(String(user?.userId)),
            userName: String(user?.name),

            invitees: [
              {
                userID: cleanUserIdForZego(String(callerId)),
                userName: String(callerName),
              },
            ],
          });

          // 👉 chỉ xoá sau khi navigate thành công
          await CallModule.removeItem('HAS_PENDING_CALL');
          await CallModule.removeItem('PENDING_ROOM_ID');
        } else {
          console.log('⏳ Waiting navigation...');
          setTimeout(tryNavigate, 300);
        }
      };

      tryNavigate();
    };

    checkCall();
  }, []);
};
