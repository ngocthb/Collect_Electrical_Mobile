import React, { useState } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DaySelection from './DaySelection';
import CustomTimeModal from './CustomTimeModal';
import { days, type Day, predefinedTimeSlots } from '../data/timeSlots';
import { useAppSelector } from '../store/hooks';
import { useNavigation } from '@react-navigation/core';
import { useDispatch } from 'react-redux';
import type { TimeSlot } from '../types/TimeSlot';
import { toggleSyncSlots, updateTimeSlot } from '../store/slices/timeSlotSlice';
const PickupTimeSelector: React.FC = () => {
  const [sameTimeForAll, setSameTimeForAll] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const timeSlot = useAppSelector(state => state.timeSlots.list);
  const dispatch = useDispatch();

  const getTimeSlotLabel = (slot: { startTime: string; endTime: string }) => {
    if (!slot) return 'Chưa chọn';
    const matchedSlot = predefinedTimeSlots.find(
      ps =>
        ps.times.length === 2 &&
        ps.times[0] === slot.startTime &&
        ps.times[1] === slot.endTime,
    );

    if (matchedSlot) return matchedSlot.label;

    if (slot.startTime || slot.endTime) return 'Giờ tự chọn';

    return 'Chưa chọn';
  };

  const [openForDay, setOpenForDay] = useState<string | null>(null);
  const [customStart, setCustomStart] = useState('');
  const [customEnd, setCustomEnd] = useState('');
  const [selectedPresetLabel, setSelectedPresetLabel] = useState<string | null>(
    null,
  );
  const [customModalVisible, setCustomModalVisible] = useState(false);
  const [editingDay, setEditingDay] = useState<string | null>(null);

  const openDropdown = (
    dayName: string,
    existing?: { startTime: string; endTime: string },
  ) => {
    setOpenForDay(openForDay === dayName ? null : dayName);
    if (existing) {
      setCustomStart(existing.startTime || '');
      setCustomEnd(existing.endTime || '');
      const matched = predefinedTimeSlots.find(
        ps =>
          ps.times.length === 2 &&
          ps.times[0] === existing.startTime &&
          ps.times[1] === existing.endTime,
      );
      setSelectedPresetLabel(matched ? matched.label : 'Giờ tự chọn');
    } else {
      setCustomStart('');
      setCustomEnd('');
      setSelectedPresetLabel(null);
    }
  };

  const applyPredefined = (dayName: string, times: string[]) => {
    const slots = { startTime: times[0] || '', endTime: times[1] || '' };
    dispatch(updateTimeSlot({ dayName, pickUpDate: '', slots } as TimeSlot));
    setCustomStart(slots.startTime);
    setCustomEnd(slots.endTime);
    setSelectedPresetLabel(
      predefinedTimeSlots.find(
        p => p.times[0] === times[0] && p.times[1] === times[1],
      )?.label || null,
    );
    setOpenForDay(null);
  };

  const applyCustom = (dayName: string) => {
    const slots = { startTime: customStart, endTime: customEnd };
    dispatch(updateTimeSlot({ dayName, pickUpDate: '', slots } as TimeSlot));
    setSelectedPresetLabel('Giờ tự chọn');
    setOpenForDay(null);
  };

  const openCustomModal = (
    dayName: string,
    existing?: { startTime: string; endTime: string },
  ) => {
    setEditingDay(dayName);
    if (existing) {
      setCustomStart(existing.startTime || '');
      setCustomEnd(existing.endTime || '');
    }
    setCustomModalVisible(true);
  };

  const handleCustomSave = (fromTime: string, toTime: string) => {
    if (!editingDay) return;
    setCustomStart(fromTime);
    setCustomEnd(toTime);
    setSelectedPresetLabel('Giờ tự chọn');
    dispatch(
      updateTimeSlot({
        dayName: editingDay,
        pickUpDate: '',
        slots: { startTime: fromTime, endTime: toTime },
      } as TimeSlot),
    );
    setCustomModalVisible(false);
    setOpenForDay(null);
    setEditingDay(null);
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
            <View>
              <View className="flex-row items-center justify-between">
                <TouchableOpacity
                  className="flex-1 flex-row items-center justify-between px-2 py-3 border rounded-md border-gray-300 bg-white mr-2"
                  onPress={() =>
                    openDropdown(timeSlot[0].dayName, timeSlot[0].slots)
                  }
                >
                  <Text className="text-sm text-text-main flex-1">
                    {getTimeSlotLabel(timeSlot[0].slots)}
                  </Text>
                  <Icon name={'chevron-down'} size={20} color="gray" />
                </TouchableOpacity>

                <View className="flex-row items-start">
                  <TouchableOpacity
                    onPress={() =>
                      openCustomModal(timeSlot[0].dayName, timeSlot[0].slots)
                    }
                    className="w-28 mr-2 border border-gray-300 rounded-md px-3 py-1 h-12"
                  >
                    <Text className="text-xs text-gray-500">Từ</Text>
                    <Text className="text-sm text-text-main ">
                      {customStart || timeSlot[0].slots.startTime || 'Chưa'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      openCustomModal(timeSlot[0].dayName, timeSlot[0].slots)
                    }
                    className="w-28 border border-gray-300 rounded-md px-3 py-1 h-12"
                  >
                    <Text className="text-xs text-gray-500">Đến</Text>
                    <Text className="text-sm text-text-main">
                      {customEnd || timeSlot[0].slots.endTime || 'Chưa'}
                    </Text>
                  </TouchableOpacity>
                </View>
              </View>

              {openForDay === timeSlot[0].dayName && (
                <View className="mt-2 bg-white border border-gray-200 rounded-md p-2 shadow-md">
                  {predefinedTimeSlots.map((ps, i) => (
                    <TouchableOpacity
                      key={i}
                      className={`px-3 py-2 flex-row items-center rounded-md mb-1 ${
                        selectedPresetLabel === ps.label
                          ? 'bg-primary-50 border-2 border-primary-100'
                          : 'bg-white'
                      }`}
                      onPress={() =>
                        applyPredefined(timeSlot[0].dayName, ps.times)
                      }
                    >
                      <View
                        className="w-3 h-2 rounded-full "
                        style={{ backgroundColor: ps.color }}
                      />
                      <View>
                        <Text className="text-sm">{ps.label}</Text>
                      </View>
                    </TouchableOpacity>
                  ))}
                </View>
              )}
            </View>
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
              <View key={index} className="mb-3">
                <View className="flex-row items-center gap-3">
                  <Text className="text-gray-800 font-medium w-6">
                    {day.dayName}
                  </Text>

                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-between px-2 py-3 border rounded-md border-gray-300 bg-white "
                    onPress={() => openDropdown(day.dayName, day.slots)}
                  >
                    <Text className="text-sm text-text-main flex-1">
                      {getTimeSlotLabel(day.slots)}
                    </Text>
                    <Icon name={'chevron-down'} size={18} color="gray" />
                  </TouchableOpacity>

                  <View className="flex-row items-start">
                    <TouchableOpacity
                      onPress={() => openCustomModal(day.dayName, day.slots)}
                      className="w-24 mr-2 border border-gray-300 rounded-md px-3 py-1 h-12"
                    >
                      <Text className="text-xs text-gray-500">Từ</Text>
                      <Text className="text-sm text-text-main ">
                        {customStart || day.slots.startTime || 'Chưa'}
                      </Text>
                    </TouchableOpacity>

                    <TouchableOpacity
                      onPress={() => openCustomModal(day.dayName, day.slots)}
                      className="w-24 border border-gray-300 rounded-md px-3 py-1 h-12"
                    >
                      <Text className="text-xs text-gray-500">Đến</Text>
                      <Text className="text-sm text-text-main ">
                        {customEnd || day.slots.endTime || 'Chưa'}
                      </Text>
                    </TouchableOpacity>
                  </View>
                </View>

                {openForDay === day.dayName && (
                  <View className="mt-2 bg-white border border-gray-200 rounded-md p-2 shadow-md ml-6">
                    {predefinedTimeSlots.map((ps, i) => (
                      <TouchableOpacity
                        key={i}
                        className={`px-3 py-2 flex-row items-center rounded-md mb-1 ${
                          selectedPresetLabel === ps.label
                            ? 'bg-primary-50 border-2 border-primary-100'
                            : 'bg-white'
                        }`}
                        onPress={() => applyPredefined(day.dayName, ps.times)}
                      >
                        <View
                          className="w-3 h-2 *:rounded-full"
                          style={{ backgroundColor: ps.color }}
                        />
                        <View>
                          <Text className="text-sm">{ps.label}</Text>
                        </View>
                      </TouchableOpacity>
                    ))}
                  </View>
                )}
              </View>
            ))
          )}
        </>
      )}
      <CustomTimeModal
        visible={customModalVisible}
        onClose={() => setCustomModalVisible(false)}
        onSave={handleCustomSave}
        initialFrom={customStart}
        initialTo={customEnd}
      />
    </>
  );
};

export default PickupTimeSelector;
