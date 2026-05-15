import axiosClient from '../config/axios';

export const callUser = async (
  callerId: string,
  callerName: string,
  calleeId: string,
  callId: string,
  roomId: string,
) => {
  try {
    console.log(callerId, callerName, calleeId, callId, roomId);
    const response = await axiosClient.post('/call/initiate', {
      callerId: callerId,
      callerName: callerName,
      calleeId: calleeId,
      callId: callId,
      roomId: roomId,
    });
    console.log('1111111111');
    console.log(response);
    return response;
  } catch (error) {
    console.error('Error calling user:', error);
    throw error;
  }
};

export const endCall = async (callId: string, partnerId: string) => {
  try {
    console.log('---------------------');
    const response = await axiosClient.post('/call/end', { callId, partnerId });
    return response;
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
};
