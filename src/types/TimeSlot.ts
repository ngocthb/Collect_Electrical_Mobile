export interface Slot {
  startTime: string;
  endTime: string;
}

export interface TimeSlot {
  dayName: string;
  pickUpDate: string;
  slots: Slot;
}

export * from './TimeSlot';
