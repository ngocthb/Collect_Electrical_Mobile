export type Day = 'T2' | 'T3' | 'T4' | 'T5' | 'T6' | 'T7' | 'CN';

export const days: Day[] = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

export interface TimeSlot {
  label: string;
  times: string[];
}
export interface PredefinedTimeSlot extends TimeSlot {
  icon: string;
  color: string;
}

export const getPredefinedTimeSlots = (
  minTime: string,
  maxTime: string,
): PredefinedTimeSlot[] => [
  {
    label: 'Chỉ buổi sáng',
    times: [minTime, '12:00'],
    icon: 'briefcase',
    color: '#e85a4f',
  },
  {
    label: 'Cả ngày',
    times: [minTime, maxTime],
    icon: 'sunny',
    color: '#F59E0B',
  },
  {
    label: 'Chỉ buổi tối',
    times: ['12:00', maxTime],
    icon: 'moon',
    color: '#8B5CF6',
  },
];
