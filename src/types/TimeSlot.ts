export interface Slot {
  startTime: string;
  endTime: string;
}

export interface TimeSlot {
  dayName: string;
  pickUpDate: string;
  slots: Slot;
}

export interface PredefinedTimeSlot {
  label: string;
  times: string[];
  icon: string;
  color: string;
}

export * from './TimeSlot';
