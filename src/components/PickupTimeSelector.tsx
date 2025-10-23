import React from 'react';
import { View, Text, TouchableOpacity } from 'react-native';
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
  { label: 'Cả ngày (9h - 21h hàng ngày)', times: ['09:00 AM', '09:00 PM'] },
  { label: 'Giờ hành chính (9h - 17h)', times: ['09:00 AM', '05:00 PM'] },
  { label: 'Chỉ buổi tối (17h - 21h)', times: ['05:00 PM', '09:00 PM'] },
  { label: 'Khung giờ tự chọn', times: [] },
];

type NavigationProp = StackNavigationProp<any>;

const DaySelection: React.FC<{
  selectedDays: string[];
  setSelectedDays: React.Dispatch<React.SetStateAction<string[]>>;
}> = ({ selectedDays, setSelectedDays }) => {
  const toggleDaySelection = (day: string) => {
    setSelectedDays(prev =>
      prev.includes(day) ? prev.filter(d => d !== day) : [...prev, day],
    );
  };

  return (
    <>
      <Text className="text-sm font-medium mb-3 text-text-main">
        Thời gian có thể lấy hàng <Text className="text-red-500">*</Text>
      </Text>
      <View className="flex-row justify-between mb-5">
        {days.map(day => (
          <TouchableOpacity
            key={day}
            className={`px-4 py-2 rounded-full ${
              selectedDays.includes(day) ? 'bg-primary-100' : 'bg-primary-50'
            }`}
            onPress={() => toggleDaySelection(day)}
          >
            <Text
              className={`text-sm font-semibold ${
                selectedDays.includes(day) ? 'text-white' : 'text-primary-100'
              }`}
            >
              {day}
            </Text>
          </TouchableOpacity>
        ))}
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

  return (
    <>
      <DaySelection
        selectedDays={selectedDays}
        setSelectedDays={setSelectedDays}
      />
      {selectedDays.map(day => (
        <View
          key={day}
          className="mb-4 flex-row items-center justify-between gap-3"
        >
          <Text className="text-gray-800 font-medium mb-2">{day}:</Text>
          <TouchableOpacity
            className="flex-1 flex-row justify-between px-4 py-2 border rounded-md border-gray-300"
            onPress={() =>
              navigation.navigate('TimeSelectionScreen', {
                day,
                setTimeSlots,
                currentTimes: timeSlots[day] || predefinedTimeSlots[0].times,
              })
            }
          >
            <Text className="text-sm text-text-main">
              {(() => {
                const slot = predefinedTimeSlots.find(
                  s =>
                    s.times.length === (timeSlots[day]?.length || 0) &&
                    s.times.every((t, i) => t === timeSlots[day][i]),
                );
                return slot ? slot.label : 'Khung giờ tự chọn';
              })()}
            </Text>
            <Icon name="chevron-right" size={20} color="gray" />
          </TouchableOpacity>
        </View>
      ))}
    </>
  );
};

export default PickupTimeSelector;
