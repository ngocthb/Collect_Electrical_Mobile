import React, { useMemo, useState, useEffect } from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';
import { ServerTime } from '../../types/common';

interface WeeklyCalendarProps {
  visible: boolean;
  onClose: () => void;
  initialDate?: Date;
  serverDate?: ServerTime;
  onSelect: (date: Date) => void;
}

const WEEKDAY_LABELS = ['T2', 'T3', 'T4', 'T5', 'T6', 'T7', 'CN'];

const addDays = (d: Date, days: number) => {
  const n = new Date(d);
  n.setDate(n.getDate() + days);
  return n;
};

const daysInMonth = (year: number, month: number) => {
  return new Date(year, month + 1, 0).getDate();
};

const WeeklyCalendar: React.FC<WeeklyCalendarProps> = ({
  visible,
  onClose,
  initialDate,
  onSelect,
  serverDate,
}) => {
  const today = useMemo(() => {
    if (serverDate?.serverDate) {
      return new Date(serverDate.serverDate);
    }
    return new Date();
  }, [serverDate]);
  const [selected, setSelected] = useState<Date>(initialDate ?? today);
  const [currentMonth, setCurrentMonth] = useState<number>(selected.getMonth());
  const [currentYear, setCurrentYear] = useState<number>(
    selected.getFullYear(),
  );
  const [currentTime, setCurrentTime] = useState<Date>(() =>
    serverDate?.serverTime ? new Date(serverDate.serverTime) : new Date(),
  );

  // Cập nhật selected khi initialDate thay đổi (từ server date)
  useEffect(() => {
    if (initialDate) {
      setSelected(initialDate);
      setCurrentMonth(initialDate.getMonth());
      setCurrentYear(initialDate.getFullYear());
    }
  }, [initialDate]);

  useEffect(() => {
    const interval = setInterval(() => {
      setCurrentTime(prev => {
        const newTime = new Date(prev);
        newTime.setSeconds(newTime.getSeconds() + 1);
        return newTime;
      });
    }, 1000);

    return () => clearInterval(interval);
  }, []);

  useEffect(() => {
    if (serverDate?.serverTime) {
      setCurrentTime(new Date(serverDate.serverTime));
    }
  }, [serverDate]);

  const changeMonth = (delta: number) => {
    const next = new Date(currentYear, currentMonth + delta, 1);
    setCurrentMonth(next.getMonth());
    setCurrentYear(next.getFullYear());
  };

  const renderMonthGrid = () => {
    const firstDay = new Date(currentYear, currentMonth, 1);
    const startWeekday = (firstDay.getDay() + 6) % 7; // Monday=0
    const totalDays = daysInMonth(currentYear, currentMonth);

    const cells: (Date | null)[] = [];
    for (let i = 0; i < startWeekday; i++) cells.push(null);
    for (let d = 1; d <= totalDays; d++)
      cells.push(new Date(currentYear, currentMonth, d));
    while (cells.length % 7 !== 0) cells.push(null);

    return (
      <View className="px-4">
        <View className="flex-row justify-between mb-2">
          {WEEKDAY_LABELS.map(label => (
            <Text key={label} className="text-xs text-center text-gray-500 w-9">
              {label}
            </Text>
          ))}
        </View>

        <View>
          {Array.from({ length: cells.length / 7 }).map((_, row) => (
            <View key={row} className="flex-row justify-between mb-1">
              {cells.slice(row * 7, row * 7 + 7).map((cell, i) => {
                const isToday = cell
                  ? new Date(cell).toDateString() === today.toDateString()
                  : false;
                const isSelected = cell
                  ? new Date(cell).toDateString() === selected.toDateString()
                  : false;
                return (
                  <TouchableOpacity
                    key={i}
                    onPress={() => {
                      if (!cell) return;
                      setSelected(cell);
                      onSelect(cell);
                      onClose();
                    }}
                    disabled={!cell}
                    className={`w-9 h-9 items-center justify-center rounded-md ${
                      isSelected ? 'bg-red-50' : ''
                    }`}
                  >
                    <Text
                      className={`text-sm ${
                        isToday ? 'text-primary-100 font-bold' : 'text-gray-700'
                      }`}
                    >
                      {cell ? cell.getDate() : ''}
                    </Text>
                  </TouchableOpacity>
                );
              })}
            </View>
          ))}
        </View>
      </View>
    );
  };

  if (!visible) return null;

  return (
    <Modal
      visible={visible}
      transparent
      animationType="fade"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40 justify-center items-center"
        onPress={onClose}
      >
        <Pressable
          className="bg-white w-[94%] max-w-md rounded-2xl p-4"
          onPress={e => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-between mb-4">
            <View className="flex-row items-center">
              <TouchableOpacity onPress={() => changeMonth(-1)} className="p-2">
                <Icon name="chevron-left" size={20} color="#e85a4f" />
              </TouchableOpacity>
              <Text className="text-sm font-semibold mx-2">
                {currentMonth + 1}/{currentYear}
              </Text>
              <TouchableOpacity onPress={() => changeMonth(1)} className="p-2">
                <Icon name="chevron-right" size={20} color="#e85a4f" />
              </TouchableOpacity>
            </View>
            <View className="flex-row items-center">
              <Text className="text-xs text-gray-500 mr-3">
                {currentTime.toLocaleTimeString('vi-VN', {
                  hour: '2-digit',
                  minute: '2-digit',
                  second: '2-digit',
                })}
              </Text>
              <TouchableOpacity onPress={onClose}>
                <Icon name="x" size={22} color="#9CA3AF" />
              </TouchableOpacity>
            </View>
          </View>

          <ScrollView>{renderMonthGrid()}</ScrollView>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default WeeklyCalendar;
