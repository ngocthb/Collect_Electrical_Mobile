import React, { useState } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import MaterialIcon from 'react-native-vector-icons/MaterialCommunityIcons';
import SubLayout from '../../layout/SubLayout';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AppButton from '../../components/ui/AppButton';
import CustomTimeModal from '../../components/CustomTimeModal';
import { useEffect, useRef } from 'react';

interface TimeSelectionScreenRouteParams {
  day: string;
  selectedDays?: string[];
  setTimeSlots: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  currentTimes: string[];
  applyToAll?: boolean;
  presetLabel?: string;
}

const predefinedTimeSlots = [
  {
    label: 'Cả ngày',
    times: ['09:00 AM', '09:00 PM'],
    icon: 'sunny',
    color: '#F59E0B',
  },
  {
    label: 'Giờ hành chính (9h - 17h)',
    times: ['09:00 AM', '05:00 PM'],
    icon: 'briefcase',
    color: '#3B82F6',
  },
  {
    label: 'Chỉ buổi tối (17h - 21h)',
    times: ['05:00 PM', '09:00 PM'],
    icon: 'moon',
    color: '#8B5CF6',
  },
  { label: 'Khung giờ tự chọn', times: [], icon: 'time', color: '#10B981' },
];

const TimeSelectionScreen = () => {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<{ params: TimeSelectionScreenRouteParams }, 'params'>>();
  const {
    day,
    selectedDays,
    setTimeSlots,
    currentTimes,
    applyToAll,
    presetLabel,
  } = route.params;

  const [selectedTimes, setSelectedTimes] = useState<string[]>(
    currentTimes && currentTimes.length === 2
      ? currentTimes
      : ['09:00 AM', '09:00 PM'],
  );
  const [isCustomTimeModalVisible, setCustomTimeModalVisible] = useState(false);

  // Store custom time if selected
  const [customTime, setCustomTime] = useState<string[] | null>(null);

  const toggleTimeSelection = (times: string[]) => {
    // If selecting a predefined slot, keep customTime if previously set
    if (
      getSelectedSlotLabel() === 'Khung giờ tự chọn' &&
      selectedTimes.length === 2
    ) {
      setCustomTime(selectedTimes);
    }
    setSelectedTimes(times);
  };

  const saveTimeSlots = () => {
    if (applyToAll && selectedDays && selectedDays.length > 0) {
      setTimeSlots(prev => {
        const updated = { ...prev };
        selectedDays.forEach(d => {
          updated[d] = selectedTimes;
        });
        return updated;
      });
    } else {
      setTimeSlots(prev => ({
        ...prev,
        [day]: selectedTimes,
      }));
    }
    navigation.goBack();
  };

  const handleSaveCustomTime = (fromTime: string, toTime: string) => {
    // Update local UI
    setSelectedTimes([fromTime, toTime]);
    setCustomTime([fromTime, toTime]);

    // Persist immediately so parent PickupTimeSelector sees the custom times
    // without the user having to press the bottom 'Lưu khung giờ' again.
    if (setTimeSlots) {
      if (applyToAll && selectedDays && selectedDays.length > 0) {
        setTimeSlots((prev: Record<string, string[]>) => {
          const updated = { ...prev };
          selectedDays.forEach(d => {
            updated[d] = [fromTime, toTime];
          });
          return updated;
        });
      } else {
        setTimeSlots((prev: Record<string, string[]>) => ({
          ...prev,
          [day]: [fromTime, toTime],
        }));
      }
    }

    // Close modal and go back to previous screen (persisted)
    setCustomTimeModalVisible(false);
    navigation.goBack();
  };

  // If we arrived with a presetLabel or applyToAll + custom times, initialize UI accordingly
  useEffect(() => {
    if (presetLabel && presetLabel !== 'Khung giờ tự chọn') {
      const predefined = predefinedTimeSlots.find(p => p.label === presetLabel);
      if (predefined) {
        setSelectedTimes(predefined.times);
      }
    }

    if (
      presetLabel === 'Khung giờ tự chọn' &&
      currentTimes &&
      currentTimes.length === 2
    ) {
      // prefill and open custom modal so user sees the times
      setSelectedTimes(currentTimes);
      setCustomTime(currentTimes);
      setCustomTimeModalVisible(true);
    }
  }, []);

  const getSelectedSlotLabel = () => {
    const found = predefinedTimeSlots.find(
      slot =>
        slot.times.length === selectedTimes.length &&
        slot.times.every((t, i) => t === selectedTimes[i]),
    );
    return found ? found.label : 'Khung giờ tự chọn';
  };

  return (
    <SubLayout title="Chọn khung giờ" onBackPress={() => navigation.goBack()}>
      <View className="flex-1 bg-gray-50">
        <ScrollView
          className="flex-1 px-5 py-4"
          showsVerticalScrollIndicator={false}
        >
          {/* Day Header */}
          <View className="bg-primary-100 rounded-xl p-5 mb-5 flex-row items-center">
            <View className="w-14 h-14 rounded-full bg-white/20 items-center justify-center mr-4">
              <MaterialIcon name="calendar-today" size={28} color="white" />
            </View>
            <View className="flex-1">
              <Text className="text-blue-100 text-sm mb-1">
                Chọn khung giờ cho
              </Text>
              <Text className="text-white font-bold text-2xl">{day}</Text>
            </View>
          </View>

          {/* Time Slots Section */}
          <View className="flex-row items-center mb-4">
            <MaterialIcon
              name="clock-time-four-outline"
              size={20}
              color="#6B7280"
            />
            <Text className="text-gray-500 font-semibold text-sm ml-2">
              Khung giờ phổ biến
            </Text>
            <View className="flex-1 h-px bg-gray-200 ml-3" />
          </View>

          {/* Time Slot Cards */}
          {predefinedTimeSlots.map((item, index) => {
            let isSelected;
            if (
              item.label === 'Khung giờ tự chọn' &&
              customTime &&
              selectedTimes.join(',') !== customTime.join(',')
            ) {
              isSelected = false;
            } else {
              isSelected = getSelectedSlotLabel() === item.label;
            }

            return (
              <TouchableOpacity
                key={item.label}
                className={`bg-white rounded-2xl p-5 mb-3 border-2 ${
                  isSelected ? 'border-green-500' : 'border-gray-100'
                }`}
                onPress={() => {
                  if (item.label === 'Khung giờ tự chọn') {
                    if (customTime) {
                      setSelectedTimes(customTime);
                    }
                    setCustomTimeModalVisible(true);
                  } else {
                    // Only update the UI selection here; actual save happens when user taps 'Lưu khung giờ'
                    toggleTimeSelection(item.times);
                  }
                }}
                style={
                  isSelected
                    ? {
                        shadowColor: '#10B981',
                        shadowOffset: { width: 0, height: 2 },
                        shadowOpacity: 0.2,
                        shadowRadius: 4,
                        elevation: 3,
                      }
                    : {}
                }
              >
                <View className="flex-row items-center">
                  {/* Icon Circle */}
                  <View
                    className="w-12 h-12 rounded-full items-center justify-center mr-4"
                    style={{ backgroundColor: `${item.color}15` }}
                  >
                    <Icon name={item.icon} size={24} color={item.color} />
                  </View>

                  {/* Content */}
                  <View className="flex-1">
                    <Text className="text-gray-900 font-bold text-base mb-1">
                      {item.label}
                    </Text>
                    {item.times.length > 0 && item.label !== 'Cả ngày' && (
                      <View className="flex-row items-center">
                        <MaterialIcon
                          name="clock-outline"
                          size={14}
                          color="#6B7280"
                        />
                        <Text className="text-gray-600 text-sm ml-1">
                          {item.times[0]} - {item.times[1]}
                        </Text>
                      </View>
                    )}
                    {/* Show custom time if selected */}
                    {item.label === 'Khung giờ tự chọn' &&
                      isSelected &&
                      selectedTimes.length === 2 && (
                        <View className="flex-row items-center mt-1">
                          <MaterialIcon
                            name="clock-check-outline"
                            size={14}
                            color="#10B981"
                          />
                          <Text className="text-green-600 text-sm font-semibold ml-1">
                            {selectedTimes[0]} - {selectedTimes[1]}
                          </Text>
                        </View>
                      )}
                  </View>

                  {/* Radio Button */}
                  <View
                    className={`w-6 h-6 rounded-full border-2 items-center justify-center ${
                      isSelected
                        ? 'border-green-500 bg-green-500'
                        : 'border-gray-300 bg-white'
                    }`}
                  >
                    {isSelected && (
                      <Icon name="checkmark" size={16} color="white" />
                    )}
                  </View>
                </View>
              </TouchableOpacity>
            );
          })}

          <View className="h-24" />
        </ScrollView>

        {/* Fixed Bottom Button */}
        <View
          className="absolute bottom-0 left-0 right-0 bg-white px-5 py-4 border-t border-gray-100"
          style={{
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -2 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          <AppButton
            title="Lưu khung giờ"
            onPress={saveTimeSlots}
            disabled={selectedTimes.length === 0}
          />
        </View>

        <CustomTimeModal
          visible={isCustomTimeModalVisible}
          onClose={() => setCustomTimeModalVisible(false)}
          onSave={handleSaveCustomTime}
          initialFrom={selectedTimes[0]}
          initialTo={selectedTimes[1]}
        />
      </View>
    </SubLayout>
  );
};

export default TimeSelectionScreen;
