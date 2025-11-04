const timeSlots: Record<string, string[]> = {
  T2: ['09:00 AM', '09:00 PM'],
  T3: ['09:00 AM', '09:00 PM'],
  T4: ['09:00 AM', '09:00 PM'],
  T5: ['09:00 AM', '09:00 PM'],
  T6: ['09:00 AM', '09:00 PM'],
  T7: ['09:00 AM', '09:00 PM'],
  CN: ['09:00 AM', '09:00 PM'],
};

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

export const predefinedTimeSlots: PredefinedTimeSlot[] = [
  {
    label: 'Cả ngày',
    times: ['00:00 AM', '24:00 PM'],
    icon: 'sunny',
    color: '#F59E0B',
  },
  {
    label: 'Giờ hành chính (9h - 17h)',
    times: ['09:00 AM', '05:00 PM'],
    icon: 'briefcase',
    color: '#3B82F6',
  },
  {
    label: 'Chỉ buổi tối (17h - 21h)',
    times: ['05:00 PM', '09:00 PM'],
    icon: 'moon',
    color: '#8B5CF6',
  },
  {
    label: 'Khung giờ tự chọn',
    times: [],
    icon: 'time',
    color: '#10B981',
  },
];

export default timeSlots;
