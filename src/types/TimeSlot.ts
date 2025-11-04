export type Slot = {
  startTime: string;
  endTime: string;
};

export type TimeSlot = {
  dayName: string;
  pickUpDate: string;
  slots: Slot;
};

export * from './TimeSlot';
