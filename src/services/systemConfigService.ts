import { get } from 'react-native/Libraries/TurboModule/TurboModuleRegistry';
import axiosClient from '../config/axios';
import {
  publicHoliday,
  systemConfig,
  ServerTime,
  RangeTimeToPost,
} from '../types/SystemConfig';

export const getRadiusMeter = async (): Promise<systemConfig> => {
  try {
    const response = await axiosClient.get(
      '/system-config/QR_SCAN_RADIUS_METERS',
    );

    return response as any;
  } catch (error) {
    console.error('Error fetching radius meter:', error);
    throw error;
  }
};

export const getTimeToPost = async (): Promise<systemConfig> => {
  try {
    const response = await axiosClient.get(
      '/system-config/CONFIG_TIME_ABLE_TO_POST',
    );
    return response as any;
  } catch (error) {
    console.error('Error fetching system config:', error);
    throw error;
  }
};

export const getRangeTimeToPost = async (): Promise<RangeTimeToPost> => {
  try {
    const response = (await axiosClient.get(
      '/system-config/TIME_ABLE_TO_POST',
    )) as any;

    const value: string = response.value as string;

    const [minTime, maxTime] = value.split(' - ').map(item => item.trim());

    return {
      minTime,
      maxTime,
    };
  } catch (error) {
    console.error('Error fetching system config:', error);
    throw error;
  }
};

export const getPublicHoliday = async (): Promise<publicHoliday[]> => {
  try {
    const response = await axiosClient.get('holiday/active');
    return (response as any) || [];
  } catch (error) {
    console.error('Error fetching public holiday:', error);
    throw error;
  }
};

export const getTimeSever = async (): Promise<ServerTime> => {
  try {
    const response = await axiosClient.get<ServerTime>(
      '/system-config/server-time',
    );
    console.log(response);
    return response as any;
  } catch (error) {
    console.error('Error fetching server time:', error);
    throw error;
  }
};

export const getAllConfig = async () => {
  const [radiusMeter, timeToPost, publicHoliday, timeServe, rangeTimeToPost] =
    await Promise.all([
      getRadiusMeter(),
      getTimeToPost(),
      getPublicHoliday(),
      getTimeSever(),
      getRangeTimeToPost(),
    ]);

  return { radiusMeter, timeToPost, publicHoliday, timeServe, rangeTimeToPost };
};
