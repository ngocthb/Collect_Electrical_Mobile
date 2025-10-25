import React, { useRef, useState } from 'react';
import {
  View,
  Text,
  Dimensions,
  FlatList,
  Animated,
  Image,
  ViewToken,
} from 'react-native';
import AppButton from '../../components/ui/AppButton';

const { width } = Dimensions.get('window');

// Import ảnh onboarding
const onboarding1 = require('../../assets/images/onboarding1.png');
const onboarding2 = require('../../assets/images/onboarding2.png');
const onboarding3 = require('../../assets/images/onboarding3.png');

interface OnboardingItem {
  id: string;
  title: string;
  description: string;
  image: any; // require(...) type
  backgroundColor: string;
}

const onboardingData: OnboardingItem[] = [
  {
    id: '1',
    title: 'Đồ điện tử không dùng',
    description: 'Thu gom nhanh chóng, tiết kiệm thời gian',
    image: onboarding1,
    backgroundColor: '#19CCA1',
  },
  {
    id: '2',
    title: 'Nhận xu đổi quà',
    description: 'Rất nhiều phần thưởng đang đợi bạn',
    image: onboarding2,
    backgroundColor: '#4169E1',
  },
  {
    id: '3',
    title: 'An toàn',
    description: 'Mọi thông tin của bạn sẽ được giữ bí mật',
    image: onboarding3,
    backgroundColor: '#061826',
  },
];

interface OnboardingScreenProps {
  onFinish: () => void;
}

export default function OnboardingScreen({ onFinish }: OnboardingScreenProps) {
  const [currentIndex, setCurrentIndex] = useState(0);
  const scrollX = useRef(new Animated.Value(0)).current;
  const slidesRef = useRef<FlatList>(null);

  const viewableItemsChanged = useRef(
    ({ viewableItems }: { viewableItems: ViewToken[] }) => {
      if (viewableItems.length > 0) {
        setCurrentIndex(viewableItems[0].index ?? 0);
      }
    },
  ).current;

  const viewConfig = useRef({ viewAreaCoveragePercentThreshold: 50 }).current;

  const scrollTo = () => {
    if (currentIndex < onboardingData.length - 1) {
      slidesRef.current?.scrollToIndex({
        index: currentIndex + 1,
        animated: true,
      });
    } else {
      onFinish();
    }
  };

  const renderItem = ({ item }: { item: OnboardingItem }) => (
    <View style={{ width }} className="flex-1 items-center justify-center px-8">
      {/* Image */}
      <View className="items-center justify-center mb-12">
        <Image source={item.image} className="w-64 h-64" resizeMode="contain" />
      </View>

      {/* Title */}
      <Text className="text-3xl font-bold text-white text-center mb-4">
        {item.title}
      </Text>

      {/* Description */}
      <Text className="text-base text-white/80 text-center px-4">
        {item.description}
      </Text>
    </View>
  );

  const Paginator = () => (
    <View className="flex-row justify-center mb-8">
      {onboardingData.map((_, index) => {
        const inputRange = [
          (index - 1) * width,
          index * width,
          (index + 1) * width,
        ];

        const dotWidth = scrollX.interpolate({
          inputRange,
          outputRange: [10, 20, 10],
          extrapolate: 'clamp',
        });

        const opacity = scrollX.interpolate({
          inputRange,
          outputRange: [0.3, 1, 0.3],
          extrapolate: 'clamp',
        });

        return (
          <Animated.View
            key={index.toString()}
            style={{
              width: dotWidth,
              opacity,
            }}
            className="h-2.5 rounded-full bg-white mx-1"
          />
        );
      })}
    </View>
  );

  return (
    <View className="flex-1">
      {/* Background */}
      <Animated.View
        style={{
          backgroundColor: onboardingData[currentIndex].backgroundColor,
        }}
        className="flex-1"
      >
        {/* Slides */}
        <View className="flex-[3]">
          <FlatList
            data={onboardingData}
            renderItem={renderItem}
            horizontal
            showsHorizontalScrollIndicator={false}
            pagingEnabled
            bounces={false}
            keyExtractor={item => item.id}
            onScroll={Animated.event(
              [{ nativeEvent: { contentOffset: { x: scrollX } } }],
              { useNativeDriver: false },
            )}
            scrollEventThrottle={32}
            onViewableItemsChanged={viewableItemsChanged}
            viewabilityConfig={viewConfig}
            ref={slidesRef}
          />
        </View>

        {/* Bottom: Paginator + Button + Skip */}
        <View className="flex-1 items-center justify-center px-8">
          <Paginator />

          <AppButton
            title={
              currentIndex === onboardingData.length - 1
                ? 'Bắt đầu ngay'
                : 'Tiếp theo'
            }
            onPress={scrollTo}
            color="#fff"
            textColor={onboardingData[currentIndex].backgroundColor}
          />
        </View>
      </Animated.View>
    </View>
  );
}
