import React, { useState } from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DaySelection from './DaySelection';
import { days, type Day, predefinedTimeSlots } from '../data/timeSlots';
import { useAppSelector } from '../store/hooks';
import { useNavigation } from '@react-navigation/core';
import { useDispatch } from 'react-redux';
import type { TimeSlot } from '../types/TimeSlot';
import { selectSlot, toggleSyncSlots } from '../store/slices/timeSlotSlice';
const PickupTimeSelector: React.FC = () => {
  const navigation = useNavigation<any>();
  const [sameTimeForAll, setSameTimeForAll] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const timeSlot = useAppSelector(state => state.timeSlots.list);
  const dispatch = useDispatch();

  const getTimeSlotLabel = (slot: { startTime: string; endTime: string }) => {
    if (!slot) return 'Chưa chọn';
    console.log(timeSlot);
    const matchedSlot = predefinedTimeSlots.find(
      ps =>
        ps.times.length === 2 &&
        ps.times[0] === slot.startTime &&
        ps.times[1] === slot.endTime,
    );

    if (matchedSlot && matchedSlot.label === 'Khung giờ tự chọn') {
      return `${slot.startTime} - ${slot.endTime}`;
    }

    return matchedSlot
      ? matchedSlot.label
      : `${slot.startTime} - ${slot.endTime}`;
  };

  const handleSelectDay = (day: TimeSlot) => async () => {
    dispatch(selectSlot(day));
    await new Promise<void>(resolve => setTimeout(resolve, 200));
    navigation.navigate('TimeSelectionScreen');
  };

  const handleSyncSlots = () => {
    setSameTimeForAll(!sameTimeForAll);
    dispatch(toggleSyncSlots());
  };

  return (
    <>
      <DaySelection
        selectedDays={selectedDays}
        setSelectedDays={setSelectedDays}
      />

      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-sm text-text-main">
          Áp dụng cùng khung giờ cho tất cả ngày
        </Text>
        <TouchableOpacity
          className={`px-3 py-1 rounded-full ${
            sameTimeForAll ? 'bg-primary-100' : 'bg-gray-200'
          }`}
          onPress={handleSyncSlots}
        >
          <Text
            className={`text-sm ${
              sameTimeForAll ? 'text-white' : 'text-gray-700'
            }`}
          >
            {sameTimeForAll ? 'Bật' : 'Tắt'}
          </Text>
        </TouchableOpacity>
      </View>

      {sameTimeForAll ? (
        <View className="mb-4">
          <Text className="text-gray-800 font-medium mb-2">
            Khung giờ (áp dụng cho tất cả ngày đã chọn):
          </Text>
          {timeSlot.length > 0 ? (
            <TouchableOpacity
              className="flex-row items-center justify-between px-4 py-3 border rounded-md border-gray-300 bg-white"
              onPress={handleSelectDay(timeSlot[0])}
            >
              <Text className="text-sm text-text-main flex-1">
                {getTimeSlotLabel(timeSlot[0].slots)}
              </Text>
              <Icon name="chevron-right" size={20} color="gray" />
            </TouchableOpacity>
          ) : (
            <View className="flex-row justify-center items-center px-4 py-3 border rounded-md border-gray-300 bg-gray-50">
              <Text className="text-gray-500 text-sm">
                Vui lòng chọn ngày để thiết lập khung giờ
              </Text>
            </View>
          )}
        </View>
      ) : (
        <>
          {timeSlot.length === 0 ? (
            <View className="mb-3 flex-row justify-center items-center">
              <Text className="text-gray-500 text-sm ">
                Vui lòng chọn ngày để thiết lập khung giờ
              </Text>
            </View>
          ) : (
            timeSlot.map((day, index) => (
              <View key={index} className="mb-3 flex-row items-center gap-3">
                <Text className="text-gray-800 font-medium w-8">
                  {day.dayName}
                </Text>
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-between px-4 py-3 border rounded-md border-gray-300 bg-white"
                  onPress={handleSelectDay(day)}
                >
                  <Text className="text-sm text-text-main flex-1">
                    {getTimeSlotLabel(day.slots)}
                  </Text>
                  <Icon name="chevron-right" size={20} color="gray" />
                </TouchableOpacity>
              </View>
            ))
          )}
        </>
      )}
    </>
  );
};

export default PickupTimeSelector;
