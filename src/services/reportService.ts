import Toast from 'react-native-toast-message';
import axiosClient from '../config/axios';

export interface CreateReportPayload {
  userId: string;
  collectionRouteId: string | null;
  description: string;
  reportType: string;
}

const submitReport = async (payload: CreateReportPayload) => {
  try {
    const response = await axiosClient.post('report', payload);
    Toast.show({
      type: 'success',
      text1: 'Gửi phản ánh thành công',
      text2: 'Cảm ơn bạn đã góp ý!',
    });
    return response;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Gửi phản ánh thất bại',
      text2: 'Vui lòng thử lại',
    });
    throw error;
  }
};

const viewMyReport = async (page: number, userId: String, type: string) => {
  try {
    const response = await axiosClient.get('report/user/filter', {
      params: {
        PageNumber: page,
        Limit: 10,
        UserId: userId,
        Type: type,
      },
    });
    console.log(response);
    return response;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Không thể tải phản ánh của bạn',
      text2: 'Vui lòng thử lại',
    });
    throw error;
  }
};

const getReportType = async () => {
  try {
    const response = await axiosClient.get('report/type');
    return (response as any) || [];
  } catch (error) {
    throw error;
  }
};

export default { submitReport, viewMyReport, getReportType };
