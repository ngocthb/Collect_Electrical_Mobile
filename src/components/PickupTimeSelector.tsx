import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, TextInput } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import DaySelection from './DaySelection';
import CustomTimeModal from './CustomTimeModal';
import { days, type Day, predefinedTimeSlots } from '../data/timeSlots';
import { useAppSelector } from '../store/hooks';
import { useDispatch } from 'react-redux';
import type { TimeSlot } from '../types/TimeSlot';
import { toggleSyncSlots, updateTimeSlot } from '../store/slices/timeSlotSlice';
const PickupTimeSelector: React.FC = () => {
  const [sameTimeForAll, setSameTimeForAll] = useState(false);
  const [selectedDays, setSelectedDays] = useState<Day[]>([]);
  const timeSlotRaw = useAppSelector(state => state.timeSlots.list);
  const dispatch = useDispatch();

  const timeSlot = [...timeSlotRaw].sort((a, b) => {
    if (!a.pickUpDate || !b.pickUpDate) return 0;
    return new Date(a.pickUpDate).getTime() - new Date(b.pickUpDate).getTime();
  });

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

  const formatTo24Hour = (time12h: string): string => {
    if (!time12h) return '';

    const cleaned = time12h.trim().toUpperCase();
    if (!cleaned.includes('AM') && !cleaned.includes('PM')) {
      return time12h;
    }
    const match = cleaned.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/);
    if (!match) return time12h;

    let hours = parseInt(match[1], 10);
    const minutes = match[2];
    const period = match[3];
    if (period === 'AM') {
      if (hours === 12) hours = 0;
    } else {
      if (hours !== 12) hours += 12;
    }

    return `${hours.toString().padStart(2, '0')}:${minutes}`;
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
    const slots = {
      startTime: formatTo24Hour(times[0] || ''),
      endTime: formatTo24Hour(times[1] || ''),
    };

    dispatch(updateTimeSlot({ dayName, pickUpDate: '', slots } as TimeSlot));
    setOpenForDay(null);
    // Clear shared state to prevent contamination
    setCustomStart('');
    setCustomEnd('');
    setSelectedPresetLabel(null);
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
    dispatch(
      updateTimeSlot({
        dayName: editingDay,
        pickUpDate: '',
        slots: {
          startTime: formatTo24Hour(fromTime),
          endTime: formatTo24Hour(toTime),
        },
      } as TimeSlot),
    );
    setCustomModalVisible(false);
    setOpenForDay(null);
    setEditingDay(null);
    // Clear shared state to prevent contamination
    setCustomStart('');
    setCustomEnd('');
    setSelectedPresetLabel(null);
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
            sameTimeForAll ? 'bg-primary-100' : 'bg-white border border-red-200'
          }`}
          onPress={handleSyncSlots}
        >
          <Text
            className={`text-sm font-semibold ${
              sameTimeForAll ? 'text-white' : 'text-primary-100'
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
                    className="w-28 mr-2 border border-gray-300 bg-white rounded-md px-3 py-1 h-12"
                  >
                    <Text className="text-xs text-gray-500">Từ</Text>
                    <Text className="text-sm text-text-main ">
                      {formatTo24Hour(timeSlot[0].slots.startTime) || 'Chưa'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() =>
                      openCustomModal(timeSlot[0].dayName, timeSlot[0].slots)
                    }
                    className="w-28 border border-gray-300 bg-white rounded-md px-3 py-1 h-12"
                  >
                    <Text className="text-xs text-gray-500">Đến</Text>
                    <Text className="text-sm text-text-main">
                      {formatTo24Hour(timeSlot[0].slots.endTime) || 'Chưa'}
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
                        className="w-2 h-2 rounded-full mr-2"
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
          {timeSlot.map((day, index) => (
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
                    className="w-24 mr-2 border border-gray-300 rounded-md px-3 py-1 h-12 bg-white"
                  >
                    <Text className="text-xs text-gray-500">Từ</Text>
                    <Text className="text-sm text-text-main ">
                      {formatTo24Hour(day.slots.startTime) || 'Chưa'}
                    </Text>
                  </TouchableOpacity>

                  <TouchableOpacity
                    onPress={() => openCustomModal(day.dayName, day.slots)}
                    className="w-24 border border-gray-300 rounded-md px-3 py-1 h-12 bg-white"
                  >
                    <Text className="text-xs text-gray-500">Đến</Text>
                    <Text className="text-sm text-text-main ">
                      {formatTo24Hour(day.slots.endTime) || 'Chưa'}
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
                          ? 'bg-red-100 border border-primary-100'
                          : 'bg-white'
                      }`}
                      onPress={() => applyPredefined(day.dayName, ps.times)}
                    >
                      <View
                        className="w-2  h-2 rounded-full mr-2"
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
          ))}
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
