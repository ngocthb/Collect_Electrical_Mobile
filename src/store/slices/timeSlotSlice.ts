import { createSlice, PayloadAction } from '@reduxjs/toolkit';
import { TimeSlot } from '../../types/TimeSlot';
import { days, type Day } from '../../data/timeSlots';

interface TimeSlotState {
  list: TimeSlot[];
  current: TimeSlot;
  originalList: TimeSlot[];
  isSynced: boolean;
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
    saveTimeSlot(state, action: PayloadAction<TimeSlot>) {
      const exists = state.list.some(
        slot => slot.dayName === action.payload.dayName,
      );
      if (!exists) {
        state.current = { ...state.current, ...action.payload };
        state.list.push(action.payload);
        state.list = sortTimeSlotsByWeekOrder(state.list);
      }
    },
    addTimeSlot(state, action: PayloadAction<TimeSlot>) {
      state.list.push(action.payload);
      state.list = sortTimeSlotsByWeekOrder(state.list);
    },
    updateTimeSlot(state, action: PayloadAction<TimeSlot>) {
      const index = state.list.findIndex(
        slot => slot.dayName === action.payload.dayName,
      );
      if (index !== -1) {
        state.list[index].slots = action.payload.slots;
      }

      if (state.current.dayName === action.payload.dayName) {
        state.current.slots = action.payload.slots;
      }
      state.list = sortTimeSlotsByWeekOrder(state.list);
    },

    removeTimeSlot(state, action: PayloadAction<string>) {
      state.list = state.list.filter(slot => slot.dayName !== action.payload);
      state.list = sortTimeSlotsByWeekOrder(state.list);
    },

    clearTimeSlot(state) {
      state.list = [];
      state.current = initialTimeSlotValue;
    },
    toggleSyncSlots(state) {
      if (!state.isSynced) {
        if (state.list.length === 0) return;
        state.originalList = JSON.parse(JSON.stringify(state.list));
        const firstSlot = state.list[0].slots;
        state.list = state.list.map(slot => ({
          ...slot,
          slots: { ...firstSlot },
        }));
        state.isSynced = true;
      } else {
        state.list = state.originalList;
        state.isSynced = false;
      }
    },
    selectSlot(state, action: PayloadAction<TimeSlot>) {
      state.current = action.payload;
    },
  },
});
export const {
  saveTimeSlot,
  addTimeSlot,
  clearTimeSlot,
  removeTimeSlot,
  toggleSyncSlots,
  selectSlot,
  updateTimeSlot,
} = timeSlotSlice.actions;
export default timeSlotSlice.reducer;
