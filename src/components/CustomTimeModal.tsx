import React, { useState, useEffect, useRef } from 'react';
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

const hours = Array.from({ length: 12 }, (_, i) =>
  String(i + 1).padStart(2, '0'),
);
const minutes = Array.from({ length: 60 }, (_, i) =>
  String(i).padStart(2, '0'),
);
const periods = ['AM', 'PM'];

const ITEM_HEIGHT = 35;

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

  useEffect(() => {
    if (!visible) {
      setFromHour('08');
      setFromMinute('00');
      setFromPeriod('AM');
      setToHour('09');
      setToMinute('00');
      setToPeriod('AM');
    }
  }, [visible]);

  const handleSave = () => {
    const fromTime = `${fromHour}:${fromMinute} ${fromPeriod}`;
    const toTime = `${toHour}:${toMinute} ${toPeriod}`;
    onSave(fromTime, toTime);
    onClose();
  };

  const renderScrollPicker = (
    value: string,
    setValue: (v: string) => void,
    options: string[],
    label: string,
  ) => {
    const scrollViewRef = useRef<ScrollView>(null);
    const selectedIndex = options.indexOf(value);

    useEffect(() => {
      if (scrollViewRef.current && visible) {
        setTimeout(() => {
          scrollViewRef.current?.scrollTo({
            y: selectedIndex * ITEM_HEIGHT,
            animated: false,
          });
        }, 100);
      }
    }, [visible]);

    const handleScroll = (event: any) => {
      const yOffset = event.nativeEvent.contentOffset.y;
      const index = Math.round(yOffset / ITEM_HEIGHT);
      if (index >= 0 && index < options.length && options[index] !== value) {
        setValue(options[index]);
      }
    };

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
                onPress={() => {
                  setValue(option);
                  scrollViewRef.current?.scrollTo({
                    y: index * ITEM_HEIGHT,
                    animated: true,
                  });
                }}
                style={{ height: ITEM_HEIGHT }}
                className="items-center justify-center"
              >
                <Text
                  className={`text-lg font-semibold ${
                    option === value ? 'text-secondary-100' : 'text-text-muted'
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
  };

  return (
    <Modal
      visible={visible}
      transparent
      animationType="slide"
      onRequestClose={onClose}
    >
      <Pressable
        className="flex-1 bg-black/40 justify-center items-center"
        onPress={onClose}
      >
        <Pressable
          className="bg-white w-[92%] max-w-md rounded-xl p-6"
          onPress={e => e.stopPropagation()}
        >
          <Text className="text-lg font-semibold mb-4">Chọn khung giờ</Text>
          <View className="flex-row justify-between mb-6 px-2">
            {/* From Time Picker */}
            <View className="flex-1 items-center">
              <Text className="text-sm font-medium mb-2">Từ giờ</Text>
              <View className="flex-row items-center justify-center bg-gray-50 rounded-lg p-2">
                {/* tighten columns: smaller width and less margin */}
                <View style={{ width: 44 }}>
                  {renderScrollPicker(fromHour, setFromHour, hours, 'h')}
                </View>
                <Text className="text-xl font-bold mx-0">:</Text>
                <View style={{ width: 44 }}>
                  {renderScrollPicker(fromMinute, setFromMinute, minutes, 'm')}
                </View>
                <View className="mx-2 items-center">
                  {periods.map(period => (
                    <TouchableOpacity
                      key={period}
                      onPress={() => setFromPeriod(period)}
                      className="py-0.5"
                    >
                      <Text
                        className={`text-base font-bold ${
                          fromPeriod === period
                            ? 'text-secondary-100'
                            : 'text-text-muted'
                        }`}
                      >
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>

            {/* spacer larger to increase gap between From and To */}
            <View style={{ width: 24 }} />

            {/* To Time Picker */}
            <View className="flex-1 items-center">
              <Text className="text-sm font-medium mb-2">Đến giờ</Text>
              <View className="flex-row items-center justify-center bg-gray-50 rounded-lg p-2">
                <View style={{ width: 44 }}>
                  {renderScrollPicker(toHour, setToHour, hours, 'h')}
                </View>
                <Text className="text-xl font-bold mx-0">:</Text>
                <View style={{ width: 44 }}>
                  {renderScrollPicker(toMinute, setToMinute, minutes, 'm')}
                </View>
                <View className="mx-2 items-center">
                  {periods.map(period => (
                    <TouchableOpacity
                      key={period}
                      onPress={() => setToPeriod(period)}
                      className="py-0.5"
                    >
                      <Text
                        className={`text-base font-bold ${
                          toPeriod === period
                            ? 'text-secondary-100'
                            : 'text-text-muted'
                        }`}
                      >
                        {period}
                      </Text>
                    </TouchableOpacity>
                  ))}
                </View>
              </View>
            </View>
          </View>
          <View className="flex-row justify-end mt-4 gap-4">
            <View className="w-24">
              <AppButton
                title="Hủy"
                color="#e1e3e5"
                textColor="#8D9194"
                onPress={onClose}
              />
            </View>
            <View className="w-24">
              <AppButton title="Lưu" color="#19CCA1" onPress={handleSave} />
            </View>
          </View>
        </Pressable>
      </Pressable>
    </Modal>
  );
};

export default CustomTimeModal;
