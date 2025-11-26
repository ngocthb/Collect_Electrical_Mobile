import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { days, type Day } from '../data/timeSlots';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  saveTimeSlot,
  removeTimeSlot,
  clearTimeSlot,
} from '../store/slices/timeSlotSlice';

// Cutoff hour (24-hour format): if current time >= this hour, start calendar from next day
const CUTOFF_HOUR = 20;

interface DaySelectionProps {
  selectedDays: Day[];
  setSelectedDays: React.Dispatch<React.SetStateAction<Day[]>>;
}

const DaySelection: React.FC<DaySelectionProps> = ({
  selectedDays,
  setSelectedDays,
}) => {
  const dispatch = useAppDispatch();
  const timeSlot = useAppSelector(state => state.timeSlots.list);

  // Sync selectedDays with Redux store
  useEffect(() => {
    if (timeSlot && timeSlot.length > 0) {
      const updatedSelectedDays: Day[] = timeSlot.map(
        slot => slot.dayName as Day,
      );
      setSelectedDays(updatedSelectedDays);
    } else {
      setSelectedDays([]);
    }
  }, [timeSlot, setSelectedDays]);

  // Get today's day name
  const getTodayDayName = (): Day => {
    const dayMap: Day[] = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();
    return dayMap[today.getDay()];
  };

  const todayDayName = getTodayDayName();

  // Check if current time in Vietnam is after cutoff
  const isAfterCutoff = (): boolean => {
    const now = new Date();
    const formatter = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: 'numeric',
      hour12: false,
    });
    const hourStr = formatter.format(now);
    const currentHour = parseInt(hourStr, 10);
    return currentHour >= CUTOFF_HOUR;
  };

  // Reorder days: before cutoff start from tomorrow, after cutoff start from day after tomorrow
  const startDayName = (() => {
    const todayIndex = days.indexOf(todayDayName);
    if (!isAfterCutoff()) {
      const nextIndex = (todayIndex + 1) % days.length;
      return days[nextIndex];
    } else {
      const nextNextIndex = (todayIndex + 2) % days.length;
      return days[nextNextIndex];
    }
  })();

  const reorderedDays = [
    ...days.slice(days.indexOf(startDayName)),
    ...days.slice(0, days.indexOf(startDayName)),
  ];

  // Safe function to get today's date in Vietnam timezone
  const getTodayInVietnam = (): Date => {
    const now = new Date();
    const parts = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
      year: 'numeric',
      month: '2-digit',
      day: '2-digit',
    }).formatToParts(now);

    const year = parseInt(
      parts.find(p => p.type === 'year')?.value || '1970',
      10,
    );
    const month = parseInt(
      parts.find(p => p.type === 'month')?.value || '01',
      10,
    );
    const day = parseInt(parts.find(p => p.type === 'day')?.value || '01', 10);

    return new Date(year, month - 1, day);
  };

  // Get next date for a specific day (accounting for cutoff shift)
  const getNextDateForDay = (dayName: Day) => {
    const dayMap: Record<Day, number> = {
      T2: 1,
      T3: 2,
      T4: 3,
      T5: 4,
      T6: 5,
      T7: 6,
      CN: 0,
    };

    const today = getTodayInVietnam();
    const todayIndex = days.indexOf(todayDayName);
    const targetIndex = days.indexOf(dayName);
    const startIndex = days.indexOf(startDayName);

    // Calculate offset from the start of the displayed week
    let offset = targetIndex - startIndex;
    if (offset < 0) offset += 7;

    // Calculate base shift: +1 day before cutoff, +2 days after cutoff
    const baseShift = isAfterCutoff() ? 2 : 1;

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + baseShift + offset);

    // Format as YYYY-MM-DD in Vietnam timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });

    return formatter.format(targetDate);
  };

  // Format date for display as DD/MM (include year if not current year)
  const getDisplayDateForDay = (dayName: Day) => {
    const today = getTodayInVietnam();
    const targetIndex = days.indexOf(dayName);
    const startIndex = days.indexOf(startDayName);

    // Calculate offset from the start of the displayed week
    let offset = targetIndex - startIndex;
    if (offset < 0) offset += 7;

    // Calculate base shift: +1 day before cutoff, +2 days after cutoff
    const baseShift = isAfterCutoff() ? 2 : 1;

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + baseShift + offset);

    const sameYear = targetDate.getFullYear() === today.getFullYear();
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    const yyyy = String(targetDate.getFullYear());
    return sameYear ? `${dd}/${mm}` : `${dd}/${mm}/${yyyy}`;
  };

  // Toggle a single day selection
  const toggleDaySelection = (day: Day) => {
    setSelectedDays(prev => {
      const isRemoving = prev.includes(day);
      if (isRemoving) {
        dispatch(removeTimeSlot(day));
      } else {
        const pickUpDate = getNextDateForDay(day);
        dispatch(
          saveTimeSlot({
            dayName: day,
            pickUpDate,
            slots: { startTime: '00:00 AM', endTime: '24:00 PM' },
          }),
        );
      }
      return isRemoving ? prev.filter(d => d !== day) : [...prev, day];
    });
  };

  // Toggle all days selection
  const isAllSelected = days.every(d => selectedDays.includes(d));
  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedDays([]);
      dispatch(clearTimeSlot());
    } else {
      setSelectedDays([...days]);
      days.forEach(day => {
        const pickUpDate = getNextDateForDay(day);
        dispatch(
          saveTimeSlot({
            dayName: day,
            pickUpDate,
            slots: { startTime: '00:00 AM', endTime: '24:00 PM' },
          }),
        );
      });
    }
  };

  return (
    <>
      <View className="flex-row justify-between mb-2">
        <View className="flex-row items-center">
          <Text className="text-sm font-medium text-primary-100">
            Thời gian có thể lấy hàng
          </Text>
          <Text className="text-red-500"> *</Text>
        </View>

        <View className="flex-row items-center">
          <TouchableOpacity
            className={`px-3 py-1 rounded-full mr-2 ${
              isAllSelected
                ? 'bg-primary-100'
                : 'bg-white border border-red-200'
            }`}
            onPress={toggleAll}
          >
            <Text
              className={`${
                isAllSelected ? 'text-white' : 'text-primary-100'
              } text-sm font-semibold`}
            >
              Tất cả
            </Text>
          </TouchableOpacity>
        </View>
      </View>

      <View className="mb-3">
        <View className="py-1">
          <View className="flex-row items-center justify-between">
            {reorderedDays.map(day => (
              <TouchableOpacity
                key={day}
                className={`px-2 py-2 rounded-xl border items-center ${
                  selectedDays.includes(day) ? 'bg-primary-100' : 'bg-white'
                }`}
                style={{
                  borderColor: selectedDays.includes(day)
                    ? '#e85a4f'
                    : '#E5E7EB',
                }}
                onPress={() => toggleDaySelection(day)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedDays.includes(day)
                      ? 'text-white'
                      : 'text-primary-100'
                  }`}
                >
                  {day}
                </Text>
                <Text
                  className={`text-xs  ${
                    selectedDays.includes(day)
                      ? 'text-white'
                      : 'text-primary-100'
                  }`}
                >
                  {getDisplayDateForDay(day)}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </>
  );
};

export default DaySelection;
