import React, { useState } from 'react';
import { View, Text, TouchableOpacity, FlatList } from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import SubLayout from '../../layout/SubLayout';
import { useNavigation, useRoute, RouteProp } from '@react-navigation/native';
import AppButton from '../../components/ui/AppButton';
import CustomTimeModal from '../../components/CustomTimeModal';
import { useEffect, useRef } from 'react';
import { ScrollView } from 'react-native';
interface TimeSelectionScreenRouteParams {
  day: string;
  setTimeSlots: React.Dispatch<React.SetStateAction<Record<string, string[]>>>;
  currentTimes: string[];
}

const predefinedTimeSlots = [
  { label: 'Cả ngày (9h - 21h hàng ngày)', times: ['09:00 AM', '09:00 PM'] },
  { label: 'Giờ hành chính (9h - 17h)', times: ['09:00 AM', '05:00 PM'] },
  { label: 'Chỉ buổi tối (17h - 21h)', times: ['05:00 PM', '09:00 PM'] },
  { label: 'Khung giờ tự chọn', times: [] },
];

const TimeSelectionScreen = () => {
  const navigation = useNavigation();
  const route =
    useRoute<RouteProp<{ params: TimeSelectionScreenRouteParams }, 'params'>>();
  const { day, setTimeSlots, currentTimes } = route.params;

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
    setTimeSlots(prev => ({
      ...prev,
      [day]: selectedTimes,
    }));
    navigation.goBack();
  };

  const handleSaveCustomTime = (fromTime: string, toTime: string) => {
    setSelectedTimes([fromTime, toTime]);
    setCustomTime([fromTime, toTime]);
  };

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
      <View className="flex-1 bg-white px-4 py-6">
        <Text className="text-lg font-semibold mb-4">
          Chọn khung giờ cho {day}
        </Text>

        {/* Restore custom time if user re-selects 'Khung giờ tự chọn' */}
        <FlatList
          data={predefinedTimeSlots}
          keyExtractor={item => item.label}
          renderItem={({ item }) => {
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
                className="flex-row items-center px-4 py-3 border rounded-md mb-2 border-gray-300"
                onPress={() => {
                  if (item.label === 'Khung giờ tự chọn') {
                    // Restore previously saved custom time for the modal if available
                    if (customTime) {
                      setSelectedTimes(customTime);
                    }
                    // Open the custom time modal without overwriting customTime
                    setCustomTimeModalVisible(true);
                  } else {
                    toggleTimeSelection(item.times);
                  }
                }}
              >
                <Icon
                  name={isSelected ? 'radio-button-on' : 'radio-button-off'}
                  size={20}
                  color={isSelected ? '#19CCA1' : '#9CA3AF'}
                  className="mr-2"
                />
                <View className="flex-1">
                  <Text className="text-base font-medium text-text-main">
                    {item.label}
                  </Text>
                  {item.times.length > 0 && (
                    <Text className="text-sm text-gray-500">
                      {item.times[0]} - {item.times[1]}
                    </Text>
                  )}
                  {/* Show custom time if selected and not a predefined slot */}
                  {item.label === 'Khung giờ tự chọn' &&
                    isSelected &&
                    selectedTimes.length === 2 && (
                      <Text className="text-sm text-blue-500">
                        {selectedTimes[0]} - {selectedTimes[1]}
                      </Text>
                    )}
                </View>
              </TouchableOpacity>
            );
          }}
        />

        <CustomTimeModal
          visible={isCustomTimeModalVisible}
          onClose={() => setCustomTimeModalVisible(false)}
          onSave={handleSaveCustomTime}
        />

        <AppButton
          title="Lưu khung giờ"
          onPress={saveTimeSlots}
          disabled={selectedTimes.length === 0}
        />
      </View>
    </SubLayout>
  );
};

export default TimeSelectionScreen;
