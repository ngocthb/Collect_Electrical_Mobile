import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { days, type Day } from '../data/timeSlots';
import { useAppDispatch } from '../store/hooks';
import {
  saveTimeSlot,
  removeTimeSlot,
  clearTimeSlot,
} from '../store/slices/timeSlotSlice';
import { useAppSelector } from '../store/hooks';
import { useEffect } from 'react';
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

  const getTodayDayName = (): Day => {
    const dayMap: Day[] = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = new Date();
    return dayMap[today.getDay()];
  };

  const todayDayName = getTodayDayName();
  const reorderedDays = [
    ...days.slice(days.indexOf(todayDayName)),
    ...days.slice(0, days.indexOf(todayDayName)),
  ];

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

    const today = new Date();
    const targetDay = dayMap[dayName];
    const currentDay = today.getDay();

    let daysToAdd = targetDay - currentDay;
    if (daysToAdd <= 0) {
      daysToAdd += 7;
    }

    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + daysToAdd);

    return targetDate.toISOString().split('T')[0];
  };

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
      <View className="flex-row justify-between">
        <View className="flex-row items-center">
          <Text className="text-sm font-medium  text-text-main items-center ">
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
                  selectedDays.includes(day)
                    ? 'bg-primary-100 border-primary-100'
                    : 'bg-white border-gray-200'
                }`}
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
              </TouchableOpacity>
            ))}
          </View>
        </View>
      </View>
    </>
  );
};

export default DaySelection;
