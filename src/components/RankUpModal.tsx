import React, { useEffect, useMemo, useRef } from 'react';
import {
  Modal,
  View,
  Animated,
  Easing,
  TouchableOpacity,
  Text,
} from 'react-native';
import Icon from 'react-native-vector-icons/Feather';

interface RankUpModalProps {
  visible: boolean;
  fromRank: 'dong' | 'bac' | 'vang' | 'kimcuong';
  toRank: 'dong' | 'bac' | 'vang' | 'kimcuong';
  onClose: () => void;
}

const cup1 = require('../assets/images/dong.png');
const cup2 = require('../assets/images/bac.png');
const cup3 = require('../assets/images/vang.png');
const cup4 = require('../assets/images/kimcuong.png');

const rankMap = {
  dong: cup1,
  bac: cup2,
  vang: cup3,
  kimcuong: cup4,
};

export default function RankUpModal({
  visible,
  fromRank,
  toRank,
  onClose,
}: RankUpModalProps) {
  const iconAnim = useRef(new Animated.Value(0)).current;
  const fireworkAnim = useRef(new Animated.Value(0)).current;

  const particles = useMemo(
    () =>
      Array.from({ length: 36 }).map((_, i) => ({
        angle: i * 10,
        distance: 110 + Math.random() * 80,
        size: 5 + Math.random() * 8,
      })),
    [],
  );

  useEffect(() => {
    if (!visible) return;

    iconAnim.setValue(0);
    fireworkAnim.setValue(0);

    Animated.sequence([
      Animated.delay(500),

      Animated.timing(iconAnim, {
        toValue: 0.6,
        duration: 500,
        easing: Easing.out(Easing.cubic),
        useNativeDriver: true,
      }),

      Animated.timing(iconAnim, {
        toValue: 1,
        duration: 500,
        easing: Easing.out(Easing.back(2)),
        useNativeDriver: true,
      }),
    ]).start();

    Animated.loop(
      Animated.timing(fireworkAnim, {
        toValue: 1,
        duration: 1200,
        easing: Easing.out(Easing.quad),
        useNativeDriver: true,
      }),
    ).start();
  }, [visible]);

  // 🎯 FROM CUP
  const fromScale = iconAnim.interpolate({
    inputRange: [0, 0.3, 0.55],
    outputRange: [1, 1.1, 0],
  });

  const fromOpacity = iconAnim.interpolate({
    inputRange: [0, 0.4, 0.55],
    outputRange: [1, 1, 0],
  });

  // 🏆 TO CUP
  const toScale = iconAnim.interpolate({
    inputRange: [0.6, 0.85, 1],
    outputRange: [0.3, 1.25, 1],
  });

  const toOpacity = iconAnim.interpolate({
    inputRange: [0.6, 0.75, 1],
    outputRange: [0, 1, 1],
  });

  const glowScale = iconAnim.interpolate({
    inputRange: [0.6, 0.8, 1],
    outputRange: [0.4, 1.2, 1],
  });

  const glowOpacity = iconAnim.interpolate({
    inputRange: [0.58, 0.72, 0.92, 1],
    outputRange: [0, 0.75, 0.45, 0.35],
  });

  const ringScale = iconAnim.interpolate({
    inputRange: [0.6, 0.9, 1],
    outputRange: [0.2, 1.45, 1.7],
  });

  const ringOpacity = iconAnim.interpolate({
    inputRange: [0.6, 0.85, 0.97, 1],
    outputRange: [0, 0.38, 0.22, 0],
  });

  // 💥 FLASH
  const flashOpacity = iconAnim.interpolate({
    inputRange: [0.6, 0.65, 0.7],
    outputRange: [0, 1, 0],
  });

  // 🎆 FIREWORK
  const progress1 = fireworkAnim;
  const progress2 = fireworkAnim.interpolate({
    inputRange: [0, 0.3, 1],
    outputRange: [0, 0, 1],
  });

  return (
    <Modal transparent visible={visible} animationType="fade">
      <View
        style={{
          flex: 1,
          alignItems: 'center',
          justifyContent: 'center',
          backgroundColor: 'rgba(0,0,0,0.55)',
        }}
      >
        {/* CLOSE */}
        <TouchableOpacity
          onPress={onClose}
          style={{
            position: 'absolute',
            top: 48,
            right: 24,
            width: 40,
            height: 40,
            borderRadius: 20,
            alignItems: 'center',
            justifyContent: 'center',
            backgroundColor: 'rgba(255,255,255,0.9)',
          }}
        >
          <Icon name="x" size={22} color="#111827" />
        </TouchableOpacity>

        <View
          style={{
            width: 260,
            height: 260,
            alignItems: 'center',
            justifyContent: 'center',
          }}
        >
          {/* 🎆 FIREWORK */}
          {[progress1, progress2].map((progress, layerIndex) =>
            particles.map((p, i) => {
              const translateY = progress.interpolate({
                inputRange: [0, 1],
                outputRange: [0, p.distance],
              });

              const scale = progress.interpolate({
                inputRange: [0, 0.25, 1],
                outputRange: [0, 1.6, 0],
              });

              const opacity = progress.interpolate({
                inputRange: [0, 0.2, 0.8, 1],
                outputRange: [0, 1, 0.4, 0],
              });

              const color =
                i % 3 === 0 ? '#f59e0b' : i % 3 === 1 ? '#10b981' : '#fb7185';

              return (
                <Animated.View
                  key={`${layerIndex}-${i}`}
                  style={{
                    position: 'absolute',
                    width: p.size,
                    height: p.size,
                    borderRadius: p.size / 2,
                    backgroundColor: color,
                    opacity,
                    transform: [
                      { rotate: `${p.angle}deg` },
                      { translateY },
                      { scale },
                    ],
                  }}
                />
              );
            }),
          )}

          {/* ICON AREA */}
          <View style={{ alignItems: 'center', justifyContent: 'center' }}>
            {/* LIGHT BURST WHEN TO CUP APPEARS */}
            <Animated.View
              style={{
                position: 'absolute',
                width: 240,
                height: 240,
                borderRadius: 125,
                backgroundColor: '#fef3c7',
                opacity: glowOpacity,
                transform: [{ scale: glowScale }],
              }}
            />

            <Animated.View
              style={{
                position: 'absolute',
                width: 240,
                height: 240,
                borderRadius: 125,
                borderWidth: 2,
                borderColor: 'rgba(253, 224, 71, 0.95)',
                opacity: ringOpacity,
                transform: [{ scale: ringScale }],
              }}
            />

            {/* FLASH */}
            <Animated.View
              style={{
                position: 'absolute',
                width: 150,
                height: 150,
                borderRadius: 75,
                backgroundColor: '#fff',
                opacity: flashOpacity,
              }}
            />

            {/* FROM CUP */}
            <Animated.Image
              source={rankMap[fromRank]}
              style={{
                position: 'absolute',
                width: 180,
                height: 180,
                opacity: fromOpacity,
                transform: [{ scale: fromScale }],
              }}
              resizeMode="contain"
            />

            {/* TO CUP */}
            <Animated.Image
              source={rankMap[toRank]}
              style={{
                width: 220,
                height: 220,
                opacity: toOpacity,
                transform: [{ scale: toScale }],
              }}
              resizeMode="contain"
            />
          </View>
        </View>
        <Text className="mt-4 text-white text-4xl font-extrabold text-center tracking-wide drop-shadow-lg">
          CHÚC MỪNG BẠN
        </Text>

        <Text
          className="mt-1 text-2xl font-semibold text-center tracking-wide drop-shadow"
          style={{ color: '#fbbf24' }}
        >
          ĐÃ THĂNG HẠNG!
        </Text>
      </View>
    </Modal>
  );
}
