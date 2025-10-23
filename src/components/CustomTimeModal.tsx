import React, {
  useState,
  useEffect,
  useRef,
  useMemo,
  useCallback,
} from 'react';
import {
  Modal,
  View,
  Text,
  TouchableOpacity,
  Pressable,
  ScrollView,
} from 'react-native';
import Icon from 'react-native-vector-icons/Ionicons';
import AppButton from './ui/AppButton';

interface CustomTimeModalProps {
  visible: boolean;
  onClose: () => void;
  onSave: (fromTime: string, toTime: string) => void;
}

const ITEM_HEIGHT = 35;

// Memoize arrays - chỉ tạo 1 lần
const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, '0'),
);
const minutes = ['00', '15', '30', '45'];
const periods = ['AM', 'PM'];

// Component con được memoized để tránh re-render không cần thiết
const ScrollPicker = React.memo<{
  value: string;
  setValue: (v: string) => void;
  options: string[];
  label: string;
}>(({ value, setValue, options, label }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const selectedIndex = useMemo(() => options.indexOf(value), [value, options]);
  const hasScrolled = useRef(false);

  // Chỉ scroll 1 lần khi mount
  useEffect(() => {
    if (scrollViewRef.current && !hasScrolled.current) {
      setTimeout(() => {
        scrollViewRef.current?.scrollTo({
          y: selectedIndex * ITEM_HEIGHT,
          animated: false,
        });
        hasScrolled.current = true;
      }, 50);
    }
  }, [selectedIndex]);

  const handleScroll = useCallback(
    (event: any) => {
      const yOffset = event.nativeEvent.contentOffset.y;
      const index = Math.round(yOffset / ITEM_HEIGHT);
      if (index >= 0 && index < options.length) {
        const newValue = options[index];
        if (newValue !== value) {
          setValue(newValue);
        }
      }
    },
    [options, value, setValue],
  );

  const handlePress = useCallback(
    (option: string, index: number) => {
      setValue(option);
      scrollViewRef.current?.scrollTo({
        y: index * ITEM_HEIGHT,
        animated: true,
      });
    },
    [setValue],
  );

  return (
    <View className="items-center mx-2">
      <View className="h-[105px] w-[50px] overflow-hidden relative">
        {/* Highlight overlay */}
        <View className="absolute top-[35px] left-0 right-0 h-[35px] bg-blue-100/30 rounded-md z-10 pointer-events-none" />

        <ScrollView
          ref={scrollViewRef}
          showsVerticalScrollIndicator={false}
          snapToInterval={ITEM_HEIGHT}
          decelerationRate="fast"
          onMomentumScrollEnd={handleScroll}
          contentContainerStyle={{
            paddingVertical: ITEM_HEIGHT,
          }}
        >
          {options.map((option, index) => (
            <TouchableOpacity
              key={option}
              onPress={() => handlePress(option, index)}
              style={{ height: ITEM_HEIGHT }}
              className="items-center justify-center"
            >
              <Text
                className={`text-lg font-semibold ${
                  option === value ? 'text-blue-600' : 'text-gray-400'
                }`}
              >
                {option}
              </Text>
            </TouchableOpacity>
          ))}
        </ScrollView>
      </View>
      <Text className="text-xs mt-1 text-gray-500">{label}</Text>
    </View>
  );
});

ScrollPicker.displayName = 'ScrollPicker';

const CustomTimeModal: React.FC<CustomTimeModalProps> = ({
  visible,
  onClose,
  onSave,
}) => {
  const [fromHour, setFromHour] = useState('08');
  const [fromMinute, setFromMinute] = useState('00');
  const [fromPeriod, setFromPeriod] = useState('AM');
  const [toHour, setToHour] = useState('09');
  const [toMinute, setToMinute] = useState('00');
  const [toPeriod, setToPeriod] = useState('AM');

  // Reset khi đóng modal
  useEffect(() => {
    if (!visible) {
      // Delay reset để tránh flicker khi đóng
      setTimeout(() => {
        setFromHour('08');
        setFromMinute('00');
        setFromPeriod('AM');
        setToHour('09');
        setToMinute('00');
        setToPeriod('AM');
      }, 300);
    }
  }, [visible]);

  const handleSave = useCallback(() => {
    const fromTime = `${fromHour}:${fromMinute} ${fromPeriod}`;
    const toTime = `${toHour}:${toMinute} ${toPeriod}`;
    onSave(fromTime, toTime);
    onClose();
  }, [
    fromHour,
    fromMinute,
    fromPeriod,
    toHour,
    toMinute,
    toPeriod,
    onSave,
    onClose,
  ]);

  // Memoize period buttons để tránh re-render
  const PeriodButtons = useMemo(
    () =>
      ({
        period,
        setPeriod,
      }: {
        period: string;
        setPeriod: (p: string) => void;
      }) =>
        (
          <View className="mx-2 items-center">
            {periods.map(p => (
              <TouchableOpacity
                key={p}
                onPress={() => setPeriod(p)}
                className="py-0.5"
              >
                <Text
                  className={`text-base font-bold ${
                    period === p ? 'text-blue-600' : 'text-gray-400'
                  }`}
                >
                  {p}
                </Text>
              </TouchableOpacity>
            ))}
          </View>
        ),
    [],
  );

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
          className="bg-white w-[92%] max-w-md rounded-2xl p-6"
          onPress={e => e.stopPropagation()}
        >
          <View className="flex-row items-center justify-between mb-4">
            <Text className="text-lg font-bold text-gray-900">
              Chọn khung giờ
            </Text>
            <TouchableOpacity onPress={onClose}>
              <Icon name="close-circle" size={24} color="#9CA3AF" />
            </TouchableOpacity>
          </View>

          <View className="flex-row justify-between mb-6 px-2">
            {/* From Time Picker */}
            <View className="flex-1 items-center">
              <Text className="text-sm font-semibold mb-3 text-gray-700">
                Từ giờ
              </Text>
              <View className="flex-row items-center justify-center bg-gray-50 rounded-xl p-2">
                <View style={{ width: 44 }}>
                  <ScrollPicker
                    value={fromHour}
                    setValue={setFromHour}
                    options={hours}
                    label="h"
                  />
                </View>
                <Text className="text-xl font-bold mx-0 text-gray-600">:</Text>
                <View style={{ width: 44 }}>
                  <ScrollPicker
                    value={fromMinute}
                    setValue={setFromMinute}
                    options={minutes}
                    label="m"
                  />
                </View>
                <PeriodButtons period={fromPeriod} setPeriod={setFromPeriod} />
              </View>
            </View>

            <View style={{ width: 24 }} />

            {/* To Time Picker */}
            <View className="flex-1 items-center">
              <Text className="text-sm font-semibold mb-3 text-gray-700">
                Đến giờ
              </Text>
              <View className="flex-row items-center justify-center bg-gray-50 rounded-xl p-2">
                <View style={{ width: 44 }}>
                  <ScrollPicker
                    value={toHour}
                    setValue={setToHour}
                    options={hours}
                    label="h"
                  />
                </View>
                <Text className="text-xl font-bold mx-0 text-gray-600">:</Text>
                <View style={{ width: 44 }}>
                  <ScrollPicker
                    value={toMinute}
                    setValue={setToMinute}
                    options={minutes}
                    label="m"
                  />
                </View>
                <PeriodButtons period={toPeriod} setPeriod={setToPeriod} />
              </View>
            </View>
          </View>

          <View className="flex-row justify-end mt-4 gap-3">
            <TouchableOpacity
              className="px-6 py-3 bg-gray-100 rounded-xl"
              onPress={onClose}
            >
              <Text className="text-gray-600 font-semibold">Hủy</Text>
            </TouchableOpacity>
            <TouchableOpacity
              className="px-6 py-3 bg-blue-500 rounded-xl"
              onPress={handleSave}
            >
              <Text className="text-white font-semibold">Lưu</Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CustomTimeModal;
