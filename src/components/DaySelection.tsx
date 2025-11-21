import React, { useEffect } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { days, type Day } from '../data/timeSlots';
import { useAppDispatch, useAppSelector } from '../store/hooks';
import {
  saveTimeSlot,
  removeTimeSlot,
  clearTimeSlot,
} from '../store/slices/timeSlotSlice';

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
  }, [timeSlot]);

  // Get today's day name
  const getTodayDayName = (): Day => {
    const dayMap: Day[] = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();
    return dayMap[today.getDay()];
  };

  const todayDayName = getTodayDayName();

  // Reorder days starting from today
  const reorderedDays = [
    ...days.slice(days.indexOf(todayDayName)),
    ...days.slice(0, days.indexOf(todayDayName)),
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

  // Get next date for a specific day
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
    const targetDay = dayMap[dayName];
    const currentDay = today.getDay();

    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) daysToAdd += 7;

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);

    // Format as YYYY-MM-DD in Vietnam timezone
    const formatter = new Intl.DateTimeFormat('en-CA', {
      timeZone: 'Asia/Ho_Chi_Minh',
    });

    return formatter.format(targetDate);
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
              isAllSelected ? 'bg-primary-100' : 'bg-primary-50'
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
                className={`px-3 py-2 rounded-full border ${
                  selectedDays.includes(day) ? 'bg-secondary-100' : 'bg-white'
                }`}
                style={{
                  borderColor: selectedDays.includes(day)
                    ? '#19CCA1'
                    : '#E5E7EB',
                }}
                onPress={() => toggleDaySelection(day)}
              >
                <Text
                  className={`text-sm font-semibold ${
                    selectedDays.includes(day)
                      ? 'text-white'
                      : 'text-secondary-100'
                  }`}
                >
                  {day}
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
