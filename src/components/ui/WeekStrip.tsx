import React, { useMemo } from 'react';
import { View, Text, TouchableOpacity, ScrollView } from 'react-native';
import Icon from 'react-native-vector-icons/MaterialCommunityIcons';

interface Props {
  selectedDate: Date;
  onSelectDate: (d: Date) => void;
  onPrevWeek?: () => void;
  onNextWeek?: () => void;
}

const WEEKDAYS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const startOfWeek = (d: Date) => {
  const date = new Date(d);
  const day = date.getDay();
  const diff = (day === 0 ? -6 : 1) - day; // Monday start
  date.setDate(date.getDate() + diff);
  date.setHours(0, 0, 0, 0);
  return date;
};

const addDays = (d: Date, days: number) => {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
};

const WeekStrip: React.FC<Props> = ({
  selectedDate,
  onSelectDate,
  onPrevWeek,
  onNextWeek,
}) => {
  const weekStart = useMemo(() => startOfWeek(selectedDate), [selectedDate]);
  const days = useMemo(
    () => Array.from({ length: 7 }, (_, i) => addDays(weekStart, i)),
    [weekStart],
  );

  return (
    <View className="flex-row items-center p-1 bg-red-50">
      {/* <TouchableOpacity onPress={onPrevWeek} className="p-2">
          <Icon name="chevron-left" size={20} color="#e85a4f" />
        </TouchableOpacity> */}

      <View
          className="flex-row jutify-between"
   
      >
        {days.map((d, idx) => {
          const isSelected = d.toDateString() === selectedDate.toDateString();
          const isToday = d.toDateString() === new Date().toDateString();
          return (
            <TouchableOpacity
              key={idx}
              onPress={() => onSelectDate(d)}
              className={`items-center justify-center mx-1 p-2 rounded-md ${
                isSelected ? 'bg-white' : ''
              }`}
              style={{ minWidth: 44 }}
            >
              <Text
                className={`text-xs ${
                  isSelected ? 'text-primary-100 font-bold' : 'text-gray-600'
                }`}
              >
                {WEEKDAYS[idx]}
              </Text>
              <Text
                className={`text-sm ${
                  isToday
                    ? 'text-primary-100 font-bold'
                    : isSelected
                    ? 'text-primary-100 font-bold'
                    : 'text-gray-700'
                }`}
              >
                {d.getDate()}
              </Text>
            </TouchableOpacity>
          );
        })}
      </View>

      {/* <TouchableOpacity onPress={onNextWeek} className="p-2">
          <Icon name="chevron-right" size={20} color="#e85a4f" />
        </TouchableOpacity> */}
    </View>
  );
};

export default WeekStrip;

