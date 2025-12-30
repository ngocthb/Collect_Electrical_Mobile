import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TimeSlot } from '../../types/TimeSlot';
import { days, type Day } from '../../data/timeSlots';

interface TimeSlotState {
  list: TimeSlot[];
  current: TimeSlot;
  originalList: TimeSlot[];
  isSynced: boolean;
  isSyncedDays: boolean;
}

const initialTimeSlotValue: TimeSlot = {
  dayName: '',
  pickUpDate: '',
  slots: { startTime: '', endTime: '' },
};

const initialState: TimeSlotState = {
  list: [],
  current: initialTimeSlotValue,
  originalList: [],
  isSynced: false,
  isSyncedDays: false,
};

const getTodayDayName = (): Day => {
  const dayMap: Day[] = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
  const today = new Date();
  return dayMap[today.getDay()];
};

const sortTimeSlotsByWeekOrder = (timeSlots: TimeSlot[]): TimeSlot[] => {
  const todayDayName = getTodayDayName();
  const todayIndex = days.indexOf(todayDayName);
  const reorderedDays = [
    ...days.slice(todayIndex),
    ...days.slice(0, todayIndex),
  ];

  return reorderedDays
    .map(dayName => timeSlots.find(slot => slot.dayName === dayName))
    .filter((slot): slot is TimeSlot => Boolean(slot));
};

const timeSlotSlice = createSlice({
  name: 'timeSlots',
  initialState,
  reducers: {
    clickDay(state, action: PayloadAction<TimeSlot>) {
      const index = state.list.findIndex(
        slot => slot.dayName === action.payload.dayName,
      );
      if (index === -1) {
        if (state.isSynced && state.list.length > 0) {
          const firstSlot = state.list[0].slots;
          action.payload.slots = { ...firstSlot };
        }
        state.list.push(action.payload);
        state.list = sortTimeSlotsByWeekOrder(state.list);
      } else {
        state.list.splice(index, 1);
      }
    },
    toggleSyncDays(state, action: PayloadAction<TimeSlot[]>) {
      state.isSyncedDays = !state.isSyncedDays;
      if (state.isSyncedDays) {
        const existingDays = new Set(state.list.map(slot => slot.dayName));
        const newSlots = action.payload.filter(
          slot => !existingDays.has(slot.dayName),
        );
        if (newSlots.length > 0) {
          state.list.push(...newSlots);
          state.list = sortTimeSlotsByWeekOrder(state.list);
        }
      } else {
        state.list = [];
      }
    },
    updateTimeSlot(state, action: PayloadAction<TimeSlot>) {
      if (state.isSynced) {
        state.list = state.list.map(slot => ({
          ...action.payload,
          dayName: slot.dayName,
          pickUpDate: slot.pickUpDate,
        }));
      } else {
        const index = state.list.findIndex(
          slot => slot.dayName === action.payload.dayName,
        );
        if (index !== -1) {
          state.list[index].slots = action.payload.slots;
        }
      }
    },
    toggleSyncSlots(state) {
      state.originalList = state.list;
      if (!state.isSynced) {
        if (state.list.length > 0) {
          const firstSlot = state.list[0].slots;
          state.list = state.list.map(slot => ({
            ...slot,
            slots: { ...firstSlot },
          }));
        }
        state.isSynced = true;
      } else {
        state.list = state.originalList;
        state.isSynced = false;
      }
    },
    clearTimeSlot(state) {
      state.list = [];
      state.originalList = [];
      state.isSynced = false;
      state.isSyncedDays = false;
      state.current = initialTimeSlotValue;
    },
  },
});
export const {
  clickDay,
  toggleSyncDays,
  clearTimeSlot,

  toggleSyncSlots,
  updateTimeSlot,
} = timeSlotSlice.actions;
export default timeSlotSlice.reducer;
