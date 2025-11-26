import React, { useState } from 'react';
// NavigationContainer is provided by App.tsx to ensure a single root navigator
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { useAppSelector } from '../store/hooks';
import SplashScreen from '../screens/public/SplashScreen';
import OnboardingScreen from '../screens/public/OnboardingScreen';

export default function RootNavigator() {
  const auth = useAppSelector(s => s.auth);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Then show onboarding
  if (showOnboarding && !auth.user) {
    return <OnboardingScreen onFinish={() => setShowOnboarding(false)} />;
  }

  // Note: don't show global splash for transient auth.loading states
  // (keeping auth screens mounted ensures Login/Register can show errors)

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
