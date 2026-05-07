import Toast from 'react-native-toast-message';
import axiosClient from '../config/axios';
import { uploadImageToCloudinary } from '../config/cloudinary';
import type { Asset } from 'react-native-image-picker';

export interface CreateReportPayload {
  userId: string;
  productId: string | null;
  description: string;
  reportType: string;
  images?: Asset[];
}

const submitReport = async (payload: CreateReportPayload) => {
  try {
    let imageUrls: string[] = [];
    if (payload.images && payload.images.length > 0) {
      imageUrls = await Promise.all(
        payload.images.map(image => uploadImageToCloudinary(image)),
      );
    }

    console.log(payload);

    const response = await axiosClient.post('report', {
      userId: payload.userId,
      productId: payload.productId || null,
      description: payload.description,
      reportType: payload.reportType,
      images: imageUrls,
    });
    console.log(response);

    return response;
  } catch (error) {
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

const getReportDetails = async (reportId: string) => {
  try {
    const response = await axiosClient.get(`report/${reportId}`);
    return response;
  } catch (error) {
    Toast.show({
      type: 'error',
      text1: 'Không thể tải chi tiết phản ánh',
      text2: 'Vui lòng thử lại',
    });
    throw error;
  }
};

export default { submitReport, viewMyReport, getReportType, getReportDetails };
