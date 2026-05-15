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
  initialFrom?: string;
  initialTo?: string;
  minTime?: string;
  maxTime?: string;
}

const ITEM_HEIGHT = 35;

const minutes = ['00', '15', '30', '45'];
const periods = ['AM', 'PM'];

const convertTo12Hour = (time24: string) => {
  const match = time24.match(/(\d{1,2}):(\d{2})/);
  if (!match) return null;

  let hours = parseInt(match[1], 10);
  const minutes = match[2];
  const period = hours >= 12 ? 'PM' : 'AM';

  if (hours > 12) hours -= 12;
  if (hours === 0) hours = 12;

  return {
    hour: String(hours).padStart(2, '0'),
    minute: minutes,
    period,
  };
};

const convertTo24Hour = (hour: string, minute: string, period: string) => {
  let hour24 = parseInt(hour, 10);

  if (period === 'PM') {
    if (hour24 !== 12) hour24 += 12;
  } else {
    if (hour24 === 12) hour24 = 0;
  }

  return `${String(hour24).padStart(2, '0')}:${minute}`;
};

const buildAllowedHours = (minTime?: string, maxTime?: string) => {
  if (!minTime || !maxTime) {
    return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  }

  const minMatch = minTime.match(/(\d{1,2}):(\d{2})/);
  const maxMatch = maxTime.match(/(\d{1,2}):(\d{2})/);

  if (!minMatch || !maxMatch) {
    return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  }

  const minHour24 = parseInt(minMatch[1], 10);
  const maxHour24 = parseInt(maxMatch[1], 10);

  const allowed = new Set<string>();

  for (let h = 0; h < 12; h++) {
    if (h >= minHour24 && h <= maxHour24) {
      const hour12 = h === 0 ? 12 : h;
      allowed.add(String(hour12).padStart(2, '0'));
    }
  }

  for (let h = 12; h < 24; h++) {
    if (h >= minHour24 && h <= maxHour24) {
      const hour12 = h === 12 ? 12 : h - 12;
      allowed.add(String(hour12).padStart(2, '0'));
    }
  }

  return Array.from(allowed).sort();
};

const buildAllowedToHours = (
  fromTime24: string,
  minTime?: string,
  maxTime?: string,
) => {
  if (!minTime || !maxTime) {
    return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  }

  const fromMatch = fromTime24.match(/(\d{1,2}):(\d{2})/);
  const minMatch = minTime.match(/(\d{1,2}):(\d{2})/);
  const maxMatch = maxTime.match(/(\d{1,2}):(\d{2})/);

  if (!fromMatch || !minMatch || !maxMatch) {
    return Array.from({ length: 12 }, (_, i) => String(i + 1).padStart(2, '0'));
  }

  const fromHour24 = parseInt(fromMatch[1], 10);
  const minHour24 = parseInt(minMatch[1], 10);
  const maxHour24 = parseInt(maxMatch[1], 10);

  const allowed = new Set<string>();

  for (let h = 0; h < 12; h++) {
    if (h >= Math.max(fromHour24, minHour24) && h <= maxHour24) {
      const hour12 = h === 0 ? 12 : h;
      allowed.add(String(hour12).padStart(2, '0'));
    }
  }

  for (let h = 12; h < 24; h++) {
    if (h >= Math.max(fromHour24, minHour24) && h <= maxHour24) {
      const hour12 = h === 12 ? 12 : h - 12;
      allowed.add(String(hour12).padStart(2, '0'));
    }
  }

  return Array.from(allowed).sort();
};

const ScrollPicker = React.memo<{
  value: string;
  setValue: (v: string) => void;
  options: string[];
  label: string;
}>(({ value, setValue, options, label }) => {
  const scrollViewRef = useRef<ScrollView>(null);
  const selectedIndex = useMemo(() => options.indexOf(value), [value, options]);
  const hasScrolled = useRef(false);

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
                  option === value ? 'text-primary-100' : 'text-gray-400'
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
  initialFrom,
  initialTo,
  minTime,
  maxTime,
}) => {
  const [fromHour, setFromHour] = useState('08');
  const [fromMinute, setFromMinute] = useState('00');
  const [fromPeriod, setFromPeriod] = useState('AM');
  const [toHour, setToHour] = useState('09');
  const [toMinute, setToMinute] = useState('00');
  const [toPeriod, setToPeriod] = useState('AM');

  const allowedHours = useMemo(
    () => buildAllowedHours(minTime, maxTime),
    [minTime, maxTime],
  );

  const fromTime24 = useMemo(
    () => convertTo24Hour(fromHour, fromMinute, fromPeriod),
    [fromHour, fromMinute, fromPeriod],
  );

  const allowedToHours = useMemo(
    () => buildAllowedToHours(fromTime24, minTime, maxTime),
    [fromTime24, minTime, maxTime],
  );

  const detectPeriodForHour = useCallback(
    (hour: string) => {
      if (!minTime || !maxTime) return 'AM';

      const minMatch = minTime.match(/(\d{1,2}):(\d{2})/);
      const maxMatch = maxTime.match(/(\d{1,2}):(\d{2})/);

      if (!minMatch || !maxMatch) return 'AM';

      const minHour24 = parseInt(minMatch[1], 10);
      const maxHour24 = parseInt(maxMatch[1], 10);
      const hour12 = parseInt(hour, 10);

      let hour24Am = hour12 === 12 ? 0 : hour12;
      if (hour24Am >= minHour24 && hour24Am <= maxHour24) return 'AM';

      let hour24Pm = hour12 === 12 ? 12 : hour12 + 12;
      if (hour24Pm >= minHour24 && hour24Pm <= maxHour24) return 'PM';

      return 'AM';
    },
    [minTime, maxTime],
  );

  useEffect(() => {
    if (!visible) {
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

  useEffect(() => {
    if (visible && initialFrom) {
      let m = initialFrom.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (m) {
        setFromHour(m[1].padStart(2, '0'));
        setFromMinute(m[2]);
        setFromPeriod(m[3].toUpperCase());
      } else {
        const converted = convertTo12Hour(initialFrom);
        if (converted) {
          setFromHour(converted.hour);
          setFromMinute(converted.minute);
          setFromPeriod(converted.period);
        }
      }
    }
    if (visible && initialTo) {
      let m = initialTo.match(/(\d{1,2}):(\d{2})\s*(AM|PM)/i);
      if (m) {
        setToHour(m[1].padStart(2, '0'));
        setToMinute(m[2]);
        setToPeriod(m[3].toUpperCase());
      } else {
        const converted = convertTo12Hour(initialTo);
        if (converted) {
          setToHour(converted.hour);
          setToMinute(converted.minute);
          setToPeriod(converted.period);
        }
      }
    }
  }, [visible, initialFrom, initialTo]);

  const handleFromHourChange = useCallback(
    (hour: string) => {
      setFromHour(hour);
      const detectedPeriod = detectPeriodForHour(hour);
      setFromPeriod(detectedPeriod);

      const newFromTime24 = convertTo24Hour(hour, fromMinute, detectedPeriod);
      const currentToTime24 = convertTo24Hour(toHour, toMinute, toPeriod);

      if (currentToTime24 < newFromTime24) {
        setToHour(hour);
        setToMinute(fromMinute);
        setToPeriod(detectedPeriod);
      }
    },
    [fromMinute, toHour, toMinute, toPeriod, detectPeriodForHour],
  );

  const handleToHourChange = useCallback(
    (hour: string) => {
      setToHour(hour);
      const detectedPeriod = detectPeriodForHour(hour);
      setToPeriod(detectedPeriod);

      const toTime24 = convertTo24Hour(hour, toMinute, detectedPeriod);
      if (toTime24 < fromTime24) {
        setToHour(fromHour);
        setToMinute(fromMinute);
        setToPeriod(fromPeriod);
      }
    },
    [
      detectPeriodForHour,
      toMinute,
      fromTime24,
      fromHour,
      fromMinute,
      fromPeriod,
    ],
  );

  const handleFromMinuteChange = useCallback(
    (minute: string) => {
      setFromMinute(minute);
      const newFromTime24 = convertTo24Hour(fromHour, minute, fromPeriod);
      const currentToTime24 = convertTo24Hour(toHour, toMinute, toPeriod);

      if (currentToTime24 < newFromTime24) {
        setToMinute(minute);
      }
    },
    [fromHour, fromPeriod, toHour, toMinute, toPeriod],
  );

  const handleToMinuteChange = useCallback(
    (minute: string) => {
      const newToTime24 = convertTo24Hour(toHour, minute, toPeriod);
      if (newToTime24 < fromTime24) {
        return;
      }
      setToMinute(minute);
    },
    [toHour, toPeriod, fromTime24],
  );

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

  const isSaveDisabled = useMemo(() => {
    if (!allowedToHours.includes(toHour)) {
      return true;
    }

    const toTime24 = convertTo24Hour(toHour, toMinute, toPeriod);
    if (fromTime24 >= toTime24) {
      return true;
    }

    return false;
  }, [allowedToHours, toHour, toMinute, toPeriod, fromTime24]);

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
                    period === p ? 'text-primary-100' : 'text-gray-400'
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
            <View className="flex-1 items-center">
              <Text className="text-sm font-semibold mb-3 text-gray-700">
                Từ giờ
              </Text>
              <View className="flex-row items-center justify-center bg-gray-50 rounded-xl p-2">
                <View style={{ width: 44 }}>
                  <ScrollPicker
                    value={fromHour}
                    setValue={handleFromHourChange}
                    options={allowedHours}
                    label="h"
                  />
                </View>
                <Text className="text-xl font-bold mx-0 text-gray-600">:</Text>
                <View style={{ width: 44 }}>
                  <ScrollPicker
                    value={fromMinute}
                    setValue={handleFromMinuteChange}
                    options={minutes}
                    label="m"
                  />
                </View>
                <PeriodButtons period={fromPeriod} setPeriod={setFromPeriod} />
              </View>
            </View>

            <View style={{ width: 24 }} />

            <View className="flex-1 items-center">
              <Text className="text-sm font-semibold mb-3 text-gray-700">
                Đến giờ
              </Text>
              <View className="flex-row items-center justify-center bg-gray-50 rounded-xl p-2">
                <View style={{ width: 44 }}>
                  <ScrollPicker
                    value={toHour}
                    setValue={handleToHourChange}
                    options={allowedToHours}
                    label="h"
                  />
                </View>
                <Text className="text-xl font-bold mx-0 text-gray-600">:</Text>
                <View style={{ width: 44 }}>
                  <ScrollPicker
                    value={toMinute}
                    setValue={handleToMinuteChange}
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
              disabled={isSaveDisabled}
              className={`px-6 py-3 rounded-xl ${
                isSaveDisabled ? 'bg-gray-300' : 'bg-primary-100'
              }`}
              onPress={handleSave}
            >
              <Text
                className={`font-semibold ${
                  isSaveDisabled ? 'text-gray-500' : 'text-white'
                }`}
              >
                Lưu
              </Text>
            </TouchableOpacity>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CustomTimeModal;
