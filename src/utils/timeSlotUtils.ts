import { PredefinedTimeSlot } from '../types/TimeSlot';

export const getTimeSlotLabel = (
  slot: { startTime?: string; endTime?: string } | null,
  minTime: string,
  maxTime: string,
): string => {
  if (!slot || (!slot.startTime && !slot.endTime)) {
    return 'Chưa chọn';
  }

  const { startTime, endTime } = slot;

  // Match predefined
  if (startTime === minTime && endTime === '12:00') {
    return 'Chỉ buổi sáng';
  }

  if (startTime === minTime && endTime === maxTime) {
    return 'Cả ngày';
  }

  if (startTime === '12:00' && endTime === maxTime) {
    return 'Chỉ buổi tối';
  }

  // Không match => custom
  return 'Giờ tự chọn';
};

export const buildPredefinedTimeSlots = (
  minTime?: string,
  maxTime?: string,
): PredefinedTimeSlot[] => {
  const safeMin = minTime || '08:00';
  const safeMax = maxTime || '17:00';

  // tránh case input bị ngược
  if (safeMin > safeMax) {
    console.warn('minTime > maxTime, fallback default');
    return buildPredefinedTimeSlots('08:00', '17:00');
  }

  const MIDDAY = '12:00';

  return [
    {
      label: 'Chỉ buổi sáng',
      times: [safeMin, MIDDAY],
      icon: 'briefcase',
      color: '#e85a4f',
    },
    {
      label: 'Cả ngày',
      times: [safeMin, safeMax],
      icon: 'sunny',
      color: '#F59E0B',
    },
    {
      label: 'Chỉ buổi chiều',
      times: [MIDDAY, safeMax],
      icon: 'moon',
      color: '#8B5CF6',
    },
  ];
};
