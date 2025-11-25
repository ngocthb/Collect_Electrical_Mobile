import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';

const logo = require('../../assets/images/logo.png');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const scaleCircle = useRef(new Animated.Value(0)).current;
  const fadeCircle = useRef(new Animated.Value(1)).current; // 👈 opacity circle
  const fadeLogo = useRef(new Animated.Value(0)).current;
  const scaleLogo = useRef(new Animated.Value(0.8)).current;

  useEffect(() => {
    // 1️⃣ Circle lớn dần
    Animated.timing(scaleCircle, {
      toValue: 1.3,
      duration: 300,
      useNativeDriver: true,
    }).start(() => {
      // 2️⃣ Circle biến mất
      Animated.timing(fadeCircle, {
        toValue: 0,
        duration: 200,
        useNativeDriver: true,
      }).start();

      // 3️⃣ Logo xuất hiện
      Animated.parallel([
        Animated.timing(fadeLogo, {
          toValue: 1,
          duration: 350,
          useNativeDriver: true,
        }),
        Animated.spring(scaleLogo, {
          toValue: 1,
          friction: 5,
          tension: 40,
          useNativeDriver: true,
        }),
      ]).start();
    });

    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      {/* Chấm tròn lớn dần → rồi biến mất */}
      <Animated.View
        style={{
          position: 'absolute',
          top: '42%',
          width: 50,
          height: 50,
          borderRadius: 60,
          backgroundColor: '#4169E1',
          transform: [{ scale: scaleCircle }],
        }}
      />

      {/* Logo + Text */}
      <Animated.View
        style={{
          opacity: fadeLogo,
          transform: [{ scale: scaleLogo }],
        }}
        className="items-center"
      >
        <View className="w-28 h-28 items-center justify-center mb-8">
          <Image source={logo} className="w-24 h-24" resizeMode="contain" />
        </View>

        <Text className="text-5xl font-bold text-text-muted tracking-widest mb-2">
          THU GOM
        </Text>
      </Animated.View>
    </View>
  );
}
