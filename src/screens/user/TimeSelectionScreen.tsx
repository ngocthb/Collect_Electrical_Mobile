import React, { useEffect, useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';

import SubLayout from '../../layout/SubLayout';
import { useNavigation } from '@react-navigation/native';
import AppButton from '../../components/ui/AppButton';
import CustomTimeModal from '../../components/CustomTimeModal';
import { predefinedTimeSlots } from '../../data/timeSlots';
import { useAppSelector } from '../../store/hooks';
import { Slot, TimeSlot } from '../../types/TimeSlot';
import { useDispatch } from 'react-redux';
import { updateTimeSlot } from '../../store/slices/timeSlotSlice';

const TimeSelectionScreen = () => {
  const navigation = useNavigation<any>();
  const timeSlot = useAppSelector(state => state.timeSlots.current);
  const [selectedTimes, setSelectedTimes] = useState<Slot>(
    timeSlot?.slots || { startTime: '', endTime: '' },
  );
  const dispatch = useDispatch();
  const [selectedLabel, setSelectedLabel] = useState<string>('');
  const [isCustomTimeModalVisible, setCustomTimeModalVisible] = useState(false);
  const [isSaving, setIsSaving] = useState(false); // Added loading state

  const getTimeSlotLabel = () => {
    if (!timeSlot?.slots) return 'Chưa chọn';

    const matchedSlot = predefinedTimeSlots.find(
      ps =>
        ps.times.length === 2 &&
        ps.times[0] === timeSlot?.slots.startTime &&
        ps.times[1] === timeSlot?.slots.endTime,
    );

    if (matchedSlot && matchedSlot.label === 'Khung giờ tự chọn') {
      return `${timeSlot?.slots.startTime} - ${timeSlot?.slots.endTime}`;
    }

    return matchedSlot
      ? matchedSlot.label
      : `${timeSlot?.slots.startTime} - ${timeSlot?.slots.endTime}`;
  };

  useEffect(() => {
    setSelectedLabel(getTimeSlotLabel());
  }, []);

  const toggleTimeSelection = (times: string[]) => {
    if (times.length === 0) {
      setCustomTimeModalVisible(true);
    } else {
      setSelectedTimes({ startTime: times[0], endTime: times[1] });
    }
  };

  const handleSaveCustomTime = (fromTime: string, toTime: string) => {
    setSelectedTimes({ startTime: fromTime, endTime: toTime });
    setCustomTimeModalVisible(false);
  };

  const handleSelect = (slot: { times: string[] }, label: string) => {
    toggleTimeSelection(slot.times);
    setSelectedLabel(label);
  };

  const handleSaveTimeSlot = () => {
    setIsSaving(true);
    const payload: TimeSlot = {
      dayName: timeSlot.dayName,
      pickUpDate: timeSlot.pickUpDate,
      slots: {
        startTime: selectedTimes.startTime,
        endTime: selectedTimes.endTime,
      },
    };
    dispatch(updateTimeSlot(payload));
    setTimeout(() => {
      navigation.goBack();
      setIsSaving(false);
    }, 200);
  };

  return (
    <SubLayout
      title="Chọn khung giờ"
      onBackPress={() => {
        navigation.goBack();
      }}
    >
      <ScrollView className="flex-1 bg-white px-4 py-4">
        <View className="flex-row gap-10 mb-4 items-center p-4 bg-gray-100 rounded-lg">
          <View>
            <Text className="text-2xl font-medium text-primary-100 mb-1">
              {timeSlot?.dayName || 'Chưa chọn ngày'}
            </Text>
          </View>
          <View className="flex-1">
            <Text className="text-sm font-medium text-gray-700 mb-1">
              Khung giờ đã chọn:
            </Text>
            <Text className="text-lg font-bold text-text-main mb-2">
              {selectedLabel}
            </Text>

            {selectedTimes.startTime !== '00:00 AM' &&
              selectedTimes.endTime !== '24:00 PM' && (
                <Text className="text-sm text-gray-600">
                  {selectedTimes.startTime} - {selectedTimes.endTime}
                </Text>
              )}
          </View>
        </View>

        {predefinedTimeSlots.map((slot, index) => {
          const isSelected =
            slot.times[0] === selectedTimes.startTime &&
            slot.times[1] === selectedTimes.endTime;

          return (
            <TouchableOpacity
              key={index}
              className={`mb-3 p-4 rounded-lg border-2 ${
                isSelected
                  ? 'border-blue-500 bg-blue-50'
                  : 'border-gray-200 bg-white'
              }`}
              onPress={() => handleSelect(slot, slot.label)}
            >
              <View className="flex-row items-center justify-between">
                <View className="flex-row items-center flex-1">
                  <View
                    className={`w-10 h-10 rounded-full mr-3 flex items-center justify-center`}
                    style={{ backgroundColor: slot.color }}
                  >
                    <Icon name={slot.icon} size={20} color="white" />
                  </View>
                  <View className="flex-1">
                    <Text className="text-base font-semibold text-gray-900">
                      {slot.label}
                    </Text>
                    {slot.label !== 'Cả ngày' && (
                      <Text className={`text-sm text-gray-500 `}>
                        {slot.times.length > 0
                          ? `${slot.times[0]} - ${slot.times[1]}`
                          : 'Thiết lập khung giờ tùy chỉnh'}
                      </Text>
                    )}
                  </View>
                </View>

                {isSelected && (
                  <Icon name="checkmark-circle" size={24} color="#3B82F6" />
                )}
              </View>

              {/* Show custom time if selected */}
              {isSelected && slot.label === 'Khung giờ tự chọn' && (
                <View className="mt-3 pt-3 border-t border-gray-200">
                  <Text className="text-sm text-gray-600">
                    Thời gian đã chọn: {selectedTimes.startTime} -{' '}
                    {selectedTimes.endTime}
                  </Text>
                </View>
              )}
            </TouchableOpacity>
          );
        })}
      </ScrollView>

      {/* Bottom button */}
      <View className="p-4 bg-white border-t border-gray-200">
        <AppButton
          title={'Lưu khung giờ'}
          onPress={handleSaveTimeSlot}
          disabled={isSaving}
          loading={isSaving}
        />
      </View>

      <CustomTimeModal
        visible={isCustomTimeModalVisible}
        onClose={() => setCustomTimeModalVisible(false)}
        onSave={handleSaveCustomTime}
        initialFrom={selectedTimes.startTime || '09:00 AM'}
        initialTo={selectedTimes.endTime || '09:00 PM'}
      />
    </SubLayout>
  );
};

export default TimeSelectionScreen;
