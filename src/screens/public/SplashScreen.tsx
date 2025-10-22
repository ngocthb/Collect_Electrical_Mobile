import React, { useEffect, useRef } from 'react';
import { View, Text, Image, Animated } from 'react-native';

const logo = require('../../assets/images/logo.png');

interface SplashScreenProps {
  onFinish: () => void;
}

export default function SplashScreen({ onFinish }: SplashScreenProps) {
  const fadeAnim = useRef(new Animated.Value(0)).current;
  const scaleAnim = useRef(new Animated.Value(0.5)).current;

  useEffect(() => {
    // Animate logo appearance
    Animated.parallel([
      Animated.timing(fadeAnim, {
        toValue: 1,
        duration: 1000,
        useNativeDriver: true,
      }),
      Animated.spring(scaleAnim, {
        toValue: 1,
        friction: 4,
        tension: 40,
        useNativeDriver: true,
      }),
    ]).start();

    // Auto-dismiss after 2.5 seconds
    const timer = setTimeout(() => {
      onFinish();
    }, 2500);

    return () => clearTimeout(timer);
  }, []);

  return (
    <View className="flex-1 items-center justify-center bg-white">
      <Animated.View
        style={{
          opacity: fadeAnim,
          transform: [{ scale: scaleAnim }],
        }}
        className="items-center"
      >
        {/* Logo */}
        <View className="w-28 h-28 items-center justify-center mb-8">
          <Image source={logo} className="w-24 h-24" resizeMode="contain" />
        </View>

        {/* App name */}
        <Text className="text-5xl font-bold text-text-muted tracking-widest mb-2">
          THU GOM
        </Text>
      </Animated.View>
    </View>
  );
}
