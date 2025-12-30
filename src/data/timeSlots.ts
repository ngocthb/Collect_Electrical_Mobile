const timeSlots: Record<string, string[]> = {
  T2: ['09:00', '17:00'],
  T3: ['09:00', '17:00'],
  T4: ['09:00', '17:00'],
  T5: ['09:00', '17:00'],
  T6: ['09:00', '17:00'],
  T7: ['09:00', '17:00'],
  CN: ['09:00', '17:00'],
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
    label: 'Giờ hành chính ',
    times: ['09:00', '17:00'],
    icon: 'briefcase',
    color: '#e85a4f',
  },
  {
    label: 'Cả ngày',
    times: ['00:00', '24:00'],
    icon: 'sunny',
    color: '#F59E0B',
  },
  {
    label: 'Chỉ buổi tối ',
    times: ['17:00', '21:00'],
    icon: 'moon',
    color: '#8B5CF6',
  },
];

export default timeSlots;
