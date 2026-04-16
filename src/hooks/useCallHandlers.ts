import { useEffect, useRef } from 'react';
import { useAppSelector } from '../store/hooks';
import { onCall, offCall } from '../services/signalrService';
import { NativeModules } from 'react-native';

const { CallModule } = NativeModules;

interface IncomingCallData {
  callId: string;
  callerId: string;
  callerName: string;
  roomId: string;
}

interface CallCancelledData {
  callId: string;
  callerId: string;
  reason?: string;
}

export const useCallHandlers = () => {
  const { user } = useAppSelector(s => s.auth);
  const pendingCallRef = useRef<IncomingCallData | null>(null);

  useEffect(() => {
    if (!user?.userId) return;

    console.log('[useCallHandlers] Setting up call event listeners');

    // 📞 Listen for incoming calls
    const handleIncomingCall = async (data: IncomingCallData) => {
      console.log('[useCallHandlers] 📞 IncomingCall received:', data);

      pendingCallRef.current = data;

      try {
        // Store call info for display
        await CallModule.setItem('INCOMING_CALL_ID', data.callId);
        await CallModule.setItem('INCOMING_CALLER_ID', data.callerId);
        await CallModule.setItem('INCOMING_CALLER_NAME', data.callerName);
        await CallModule.setItem('INCOMING_ROOM_ID', data.roomId);
        await CallModule.setItem('HAS_INCOMING_CALL', 'true');

        console.log('[useCallHandlers] ✅ Incoming call info stored');
      } catch (err) {
        console.error('[useCallHandlers] ❌ Error storing incoming call:', err);
      }
    };

    // ❌ Listen for call cancellation (A hung up before B accepted)
    const handleCallCancelled = async (data: CallCancelledData) => {
      console.log('[useCallHandlers] 📵 CallCancelled received:', data);

      // Check if this is the call we're waiting for
      if (pendingCallRef.current?.callId === data.callId) {
        console.log('[useCallHandlers] Caller cancelled the incoming call');

        try {
          // Clear pending call
          await CallModule.removeItem('INCOMING_CALL_ID');
          await CallModule.removeItem('INCOMING_CALLER_ID');
          await CallModule.removeItem('INCOMING_CALLER_NAME');
          await CallModule.removeItem('INCOMING_ROOM_ID');
          await CallModule.removeItem('HAS_INCOMING_CALL');

          pendingCallRef.current = null;

          console.log('[useCallHandlers] ✅ Incoming call cleared');
        } catch (err) {
          console.error(
            '[useCallHandlers] ❌ Error clearing incoming call:',
            err,
          );
        }
      }
    };

    // ✅ Listen for call acceptance (B accepted)
    const handleCallAccepted = async (data: {
      callId: string;
      calleeId: string;
    }) => {
      console.log('[useCallHandlers] ✅ CallAccepted received:', data);

      if (pendingCallRef.current?.callId === data.callId) {
        console.log('[useCallHandlers] Receiver accepted the call');
        // Call is now active - will be handled by Zego
        pendingCallRef.current = null;
      }
    };

    // ⏭️ Listen for call rejection (B rejected)
    const handleCallRejected = async (data: {
      callId: string;
      calleeId: string;
      reason?: string;
    }) => {
      console.log('[useCallHandlers] ⏭️ CallRejected received:', data);

      if (pendingCallRef.current?.callId === data.callId) {
        console.log(
          '[useCallHandlers] Receiver rejected the call:',
          data.reason,
        );

        try {
          // Clear pending call
          await CallModule.removeItem('INCOMING_CALL_ID');
          await CallModule.removeItem('INCOMING_CALLER_ID');
          await CallModule.removeItem('INCOMING_CALLER_NAME');
          await CallModule.removeItem('INCOMING_ROOM_ID');
          await CallModule.removeItem('HAS_INCOMING_CALL');

          pendingCallRef.current = null;

          console.log('[useCallHandlers] ✅ Rejected call cleared');
        } catch (err) {
          console.error(
            '[useCallHandlers] ❌ Error clearing rejected call:',
            err,
          );
        }
      }
    };

    // Register all listeners
    onCall('IncomingCall', handleIncomingCall);
    onCall('CallCancelled', handleCallCancelled);
    onCall('CallAccepted', handleCallAccepted);
    onCall('CallRejected', handleCallRejected);

    console.log('[useCallHandlers] ✅ All call event listeners registered');

    // Cleanup
    return () => {
      console.log('[useCallHandlers] Removing call event listeners');
      offCall('IncomingCall');
      offCall('CallCancelled');
      offCall('CallAccepted');
      offCall('CallRejected');
    };
  }, [user?.userId]);
};
