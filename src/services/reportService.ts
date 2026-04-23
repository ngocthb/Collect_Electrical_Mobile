import Toast from 'react-native-toast-message';
import axiosClient from '../config/axios';
import { uploadImageToCloudinary } from '../config/cloudinary';
import type { Asset } from 'react-native-image-picker';

export interface CreateReportPayload {
  userId: string;
  collectionRouteId: string | null;
  description: string;
  reportType: string;
  images?: Asset[];
}

const submitReport = async (payload: CreateReportPayload) => {
  try {
    // Upload images to Cloudinary and get URLs
    let imageUrls: string[] = [];
    if (payload.images && payload.images.length > 0) {
      imageUrls = await Promise.all(
        payload.images.map(image => uploadImageToCloudinary(image)),
      );
    }

    // Send report with image URLs
    const response = await axiosClient.post('report', {
      userId: payload.userId,
      collectionRouteId: payload.collectionRouteId || null,
      description: payload.description,
      reportType: payload.reportType,
      imageUrls: imageUrls,
    });

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

export default { submitReport, viewMyReport, getReportType };
