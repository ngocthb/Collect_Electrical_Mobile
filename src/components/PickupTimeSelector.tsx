import React, { useState, useEffect } from 'react';
import { View, Text, TouchableOpacity, Alert } from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { useNavigation } from '@react-navigation/native';
import { StackNavigationProp } from '@react-navigation/stack';

interface PickupTimeSelectorProps {
  selectedDays: string[];
  setSelectedDays: React.Dispatch<React.SetStateAction<string[]>>;
  timeSlots: Record<string, string[]>;
  setTimeSlots: (slots: Record<string, string[]>) => void;
}

const days = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];
const predefinedTimeSlots = [
  { label: 'Cả ngày', times: ['09:00 AM', '09:00 PM'] },
  { label: 'Giờ hành chính (9h - 17h)', times: ['09:00 AM', '05:00 PM'] },
  { label: 'Chỉ buổi tối (17h - 21h)', times: ['05:00 PM', '09:00 PM'] },
  { label: 'Khung giờ tự chọn', times: [] },
];

type NavigationProp = StackNavigationProp<any>;

const DaySelection: React.FC<{
  selectedDays: string[];
  setSelectedDays: React.Dispatch<React.SetStateAction<string[]>>;
  sameTimeForAll: boolean;
  timeSlots: Record<string, string[]>;
  setTimeSlots: (slots: Record<string, string[]>) => void;
}> = ({
  selectedDays,
  setSelectedDays,
  sameTimeForAll,
  timeSlots,
  setTimeSlots,
}) => {
  const toggleDaySelection = (day: string) => {
    setSelectedDays(prev => {
      const isRemoving = prev.includes(day);
      const newSelection = isRemoving
        ? prev.filter(d => d !== day)
        : [...prev, day];

      // If sameTimeForAll is enabled and we're adding a day, sync time immediately
      if (!isRemoving && sameTimeForAll && newSelection.length > 0) {
        const referenceTimes = timeSlots[newSelection[0]];
        if (referenceTimes && referenceTimes.length > 0) {
          setTimeSlots({
            ...timeSlots,
            [day]: referenceTimes,
          });
        }
      }

      return newSelection;
    });
  };

  const isAllSelected = days.every(d => selectedDays.includes(d));
  const toggleAll = () => {
    if (isAllSelected) {
      setSelectedDays([]);
    } else {
      const allDays = [...days];
      setSelectedDays(allDays);

      // If sameTimeForAll is enabled, sync all days immediately
      if (sameTimeForAll && selectedDays.length > 0) {
        const referenceTimes = timeSlots[selectedDays[0]];
        if (referenceTimes && referenceTimes.length > 0) {
          const updated = { ...timeSlots };
          allDays.forEach(day => {
            updated[day] = referenceTimes;
          });
          setTimeSlots(updated);
        }
      }
    }
  };

  return (
    <>
      <Text className="text-sm font-medium mb-3 text-text-main">
        Thời gian có thể lấy hàng <Text className="text-red-500">*</Text>
      </Text>
      <View className="mb-3">
        <View className="flex-row items-center justify-between mb-2">
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
          <Text className="text-sm text-text-muted">
            {selectedDays.length} đã chọn
          </Text>
        </View>

        <View className="py-1">
          <View className="flex-row items-center justify-between">
            {days.map(day => (
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

const PickupTimeSelector: React.FC<PickupTimeSelectorProps> = ({
  selectedDays,
  setSelectedDays,
  timeSlots,
  setTimeSlots,
}) => {
  const navigation = useNavigation<NavigationProp>();
  const [sameTimeForAll, setSameTimeForAll] = useState(false);

  // Watch for changes in selectedDays when sameTimeForAll is enabled
  useEffect(() => {
    if (!sameTimeForAll || selectedDays.length === 0) return;

    // Get reference time from first selected day
    const referenceTimes = timeSlots[selectedDays[0]];
    if (!referenceTimes || referenceTimes.length === 0) return;

    // Apply reference time to any newly selected days that don't have it yet
    const updated = { ...timeSlots };
    let hasChanges = false;

    selectedDays.forEach(day => {
      const dayTimes = timeSlots[day] || [];
      const isDifferent =
        dayTimes.length !== referenceTimes.length ||
        dayTimes.some((t, i) => t !== referenceTimes[i]);

      if (isDifferent) {
        updated[day] = referenceTimes;
        hasChanges = true;
      }
    });

    if (hasChanges) {
      setTimeSlots(updated);
    }
  }, [selectedDays, sameTimeForAll]);

  // Helper: Get display text for a time slot
  const getTimeSlotDisplay = (times: string[] | undefined): string => {
    if (!times || times.length === 0) return 'Chưa chọn';

    const slot = predefinedTimeSlots.find(
      s =>
        s.times.length === times.length &&
        s.times.every((t, i) => t === times[i]),
    );

    return slot ? slot.label : times.join(' - ');
  };

  // Helper: Check if all selected days have the same time slot
  const getCommonTimeSlot = (): string[] | null => {
    if (selectedDays.length === 0) return null;

    const firstDayTimes = timeSlots[selectedDays[0]];
    if (!firstDayTimes) return null;

    const allSame = selectedDays.every(day => {
      const dayTimes = timeSlots[day] || [];
      return (
        dayTimes.length === firstDayTimes.length &&
        dayTimes.every((t, i) => t === firstDayTimes[i])
      );
    });

    return allSame ? firstDayTimes : null;
  };

  // Get the reference time slot when sameTimeForAll is enabled
  const getReferenceTimeSlot = (): string[] | null => {
    if (selectedDays.length === 0) return null;
    return timeSlots[selectedDays[0]] || null;
  };

  // Handle toggle for "same time for all"
  const handleToggleSameTime = () => {
    if (!selectedDays.length) {
      Alert.alert('Chọn ngày', 'Vui lòng chọn ít nhất một ngày trước');
      return;
    }

    const newValue = !sameTimeForAll;
    setSameTimeForAll(newValue);

    if (newValue) {
      // When enabling, apply the first selected day's time to all selected days
      const sourceTimes = timeSlots[selectedDays[0]];
      if (sourceTimes && sourceTimes.length > 0) {
        const updated = { ...timeSlots };
        selectedDays.forEach(day => {
          updated[day] = sourceTimes;
        });
        setTimeSlots(updated);
      }
    }
  };

  // Handle navigation to time selection screen
  const handleTimeSelection = () => {
    if (!selectedDays.length) {
      Alert.alert(
        'Chọn ngày',
        'Vui lòng chọn ít nhất một ngày trước khi chọn khung giờ',
      );
      return;
    }

    const currentTimes = timeSlots[selectedDays[0]] || [];

    navigation.navigate('TimeSelectionScreen', {
      day: selectedDays[0],
      selectedDays: selectedDays,
      setTimeSlots,
      currentTimes,
      applyToAll: true,
    } as any);
  };

  const handleIndividualTimeSelection = (day: string) => {
    navigation.navigate('TimeSelectionScreen', {
      day,
      setTimeSlots,
      currentTimes: timeSlots[day] || [],
      applyToAll: false,
    } as any);
  };

  return (
    <>
      <DaySelection
        selectedDays={selectedDays}
        setSelectedDays={setSelectedDays}
        sameTimeForAll={sameTimeForAll}
        timeSlots={timeSlots}
        setTimeSlots={setTimeSlots}
      />

      {/* Toggle: same time for all selected days */}
      <View className="mb-4 flex-row items-center justify-between">
        <Text className="text-sm text-text-main">
          Áp dụng cùng khung giờ cho tất cả ngày
        </Text>
        <TouchableOpacity
          className={`px-3 py-1 rounded-full ${
            sameTimeForAll ? 'bg-primary-100' : 'bg-gray-200'
          }`}
          onPress={handleToggleSameTime}
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
        // Single time slot selector for all days
        <View className="mb-4">
          <Text className="text-gray-800 font-medium mb-2">
            Khung giờ (áp dụng cho tất cả ngày đã chọn):
          </Text>
          <TouchableOpacity
            className="flex-row items-center justify-between px-4 py-3 border rounded-md border-gray-300 bg-white"
            onPress={handleTimeSelection}
          >
            <Text className="text-sm text-text-main flex-1">
              {(() => {
                // Always show reference time from first day when sameTimeForAll is on
                const referenceTimes = getReferenceTimeSlot();
                if (referenceTimes && referenceTimes.length > 0) {
                  return getTimeSlotDisplay(referenceTimes);
                }
                return 'Chọn khung giờ';
              })()}
            </Text>
            <Icon name="chevron-right" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      ) : (
        // Individual time slot selectors for each day
        <>
          {selectedDays.length === 0 ? (
            <View className="mb-3 flex-row justify-center items-center">
              <Text className="text-gray-500 text-sm ">
                Vui lòng chọn ngày để thiết lập khung giờ
              </Text>
            </View>
          ) : (
            days
              .filter(day => selectedDays.includes(day))
              .map(day => (
                <View key={day} className="mb-3 flex-row items-center gap-3">
                  <Text className="text-gray-800 font-medium w-8">{day}</Text>
                  <TouchableOpacity
                    className="flex-1 flex-row items-center justify-between px-4 py-3 border rounded-md border-gray-300 bg-white"
                    onPress={() => handleIndividualTimeSelection(day)}
                  >
                    <Text className="text-sm text-text-main flex-1">
                      {getTimeSlotDisplay(timeSlots[day])}
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
