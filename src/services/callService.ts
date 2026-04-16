import axiosClient from '../config/axios';

export const callUser = async (
  callerId: string,
  callerName: string,
  calleeId: string,
  callId: string,
  roomId: string,
) => {
  try {
    const response = await axiosClient.post('/call/call-user', {
      callerId,
      callerName,
      calleeId,
      callId,
      roomId,
    });
    return response;
  } catch (error) {
    console.error('Error calling user:', error);
    throw error;
  }
};

export const endCall = async (callId: string, partnerId: string) => {
  try {
    const response = await axiosClient.post('/call/end', { callId, partnerId });
    return response;
  } catch (error) {
    console.error('Error ending call:', error);
    throw error;
  }
};
