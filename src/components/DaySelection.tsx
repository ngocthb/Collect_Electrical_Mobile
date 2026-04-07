import { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import { days, type Day } from '../data/timeSlots';
import { useAppDispatch } from '../store/hooks';
import { toggleSyncDays, clickDay } from '../store/slices/timeSlotSlice';
import { useSelector } from 'react-redux';

interface DaySelectionProps {
  selectedDays: Day[];
  setSelectedDays: React.Dispatch<React.SetStateAction<Day[]>>;
}

const DaySelection: React.FC<DaySelectionProps> = ({
  selectedDays,
  setSelectedDays,
}) => {
  const [CUTOFF_TIME, timeSever, publicHoliday] = useSelector((state: any) => [
    state?.systemConfig?.timeToPost?.value,
    state?.systemConfig?.timeSever,
    state?.systemConfig?.publicHoliday,
  ]);
  console.log(publicHoliday);

  const dispatch = useAppDispatch();

  const getServerNow = (): Date => {
    if (timeSever?.serverTime) return new Date(timeSever.serverTime);
    if (timeSever?.serverDate) return new Date(timeSever.serverDate);
    return new Date();
  };

  // Get today's day name

  const getTodayDayName = (): Day => {
    const dayMap: Day[] = ['CN', 'T2', 'T3', 'T4', 'T5', 'T6', 'T7'];
    const today = getServerNow();
    return dayMap[today.getDay()];
  };

  const todayDayName = getTodayDayName();

  // Check if current time in Vietnam is after cutoff
  const isAfterCutoff = (): boolean => {
    const now = getServerNow();
    const parts = new Intl.DateTimeFormat('en-US', {
      timeZone: 'Asia/Ho_Chi_Minh',
      hour: '2-digit',
      minute: '2-digit',
      hour12: false,
    }).formatToParts(now);

    const currentHour = parseInt(
      parts.find(part => part.type === 'hour')?.value || '0',
      10,
    );
    const currentMinute = parseInt(
      parts.find(part => part.type === 'minute')?.value || '0',
      10,
    );

    const [cutoffHourStr, cutoffMinuteStr] = CUTOFF_TIME.split(':');
    const cutoffHour = parseInt(cutoffHourStr || '0', 10);
    const cutoffMinute = parseInt(cutoffMinuteStr || '0', 10);

    if (currentHour > cutoffHour) return true;
    if (currentHour < cutoffHour) return false;
    return currentMinute >= cutoffMinute;
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
    const now = getServerNow();
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
    let offset = targetIndex - startIndex;
    if (offset < 0) offset += 7;
    const baseShift = isAfterCutoff() ? 2 : 1;
    const targetDate = new Date(today);
    targetDate.setDate(today.getDate() + baseShift + offset);
    const dd = String(targetDate.getDate()).padStart(2, '0');
    const mm = String(targetDate.getMonth() + 1).padStart(2, '0');
    return `${dd}/${mm}`;
  };

  const checkIsPublicHoliday = (dayName: Day): boolean => {
    if (!publicHoliday || !Array.isArray(publicHoliday)) return false;

    const displayDate = getNextDateForDay(dayName);

    return publicHoliday.some(
      holiday =>
        displayDate >= holiday.startDate && displayDate <= holiday.endDate,
    );
  };
  const toggleDaySelection = (day: Day) => {
    if (selectedDays.includes(day)) {
      setSelectedDays(prev => prev.filter(d => d !== day));
    } else {
      setSelectedDays(prev => [...prev, day]);
    }

    dispatch(
      clickDay({
        dayName: day,
        pickUpDate: getNextDateForDay(day),
        slots: { startTime: '09:00', endTime: '17:00' },
      }),
    );
  };

  const isAllSelected = reorderedDays
    .filter(day => !checkIsPublicHoliday(day))
    .every(day => selectedDays.includes(day));

  const toggleAll = () => {
    const allDays = reorderedDays.filter(day => !checkIsPublicHoliday(day));

    if (isAllSelected) {
      setSelectedDays([]);
      dispatch(toggleSyncDays([]));
    } else {
      setSelectedDays(allDays);

      const data = allDays.map(day => ({
        dayName: day,
        pickUpDate: getNextDateForDay(day),
        slots: { startTime: '09:00', endTime: '17:00' },
      }));

      dispatch(toggleSyncDays(data));
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
                  opacity: checkIsPublicHoliday(day) ? 0.5 : 1,
                }}
                onPress={() => toggleDaySelection(day)}
                disabled={checkIsPublicHoliday(day)}
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
