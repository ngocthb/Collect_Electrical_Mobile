import React, { useState, useEffect } from 'react';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { useAppSelector } from '../store/hooks';
import SplashScreen from '../screens/public/SplashScreen';
import OnboardingScreen from '../screens/public/OnboardingScreen';
import AsyncStorage from '@react-native-async-storage/async-storage';

export default function RootNavigator() {
  const auth = useAppSelector(s => s.auth);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(false);

  useEffect(() => {
    const checkOnboarding = async () => {
      try {
        const hasSeenOnboarding = await AsyncStorage.getItem(
          'hasSeenOnboarding',
        );
        if (!hasSeenOnboarding) {
          setShowOnboarding(true);
        }
      } catch (error) {
        console.error('Error checking onboarding:', error);
      }
    };

    checkOnboarding();
  }, []);

  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  if (showOnboarding && !auth.user) {
    return (
      <OnboardingScreen
        onFinish={async () => {
          await AsyncStorage.setItem('hasSeenOnboarding', 'true');
          setShowOnboarding(false);
        }}
      />
    );
  }

  return (
    <>
      {!auth.user ? (
        <AuthNavigator />
      ) : auth.user.role === 'Collector' ? (
        <MainNavigator delivery />
      ) : (
        <MainNavigator />
      )}
    </>
  );
}
