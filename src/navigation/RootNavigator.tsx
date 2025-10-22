import React, { useContext, useState } from 'react';
import { NavigationContainer } from '@react-navigation/native';
import AuthNavigator from './AuthNavigator';
import MainNavigator from './MainNavigator';
import { AuthContext } from '../context/AuthContext';
import SplashScreen from '../screens/public/SplashScreen';
import OnboardingScreen from '../screens/public/OnboardingScreen';

export default function RootNavigator() {
  const { user, role, loading } = useContext(AuthContext);
  const [showSplash, setShowSplash] = useState(true);
  const [showOnboarding, setShowOnboarding] = useState(true);

  // Show splash screen first
  if (showSplash) {
    return <SplashScreen onFinish={() => setShowSplash(false)} />;
  }

  // Then show onboarding
  if (showOnboarding && !user) {
    return <OnboardingScreen onFinish={() => setShowOnboarding(false)} />;
  }

  if (loading) {
    return <SplashScreen onFinish={() => {}} />;
  }

  return (
    <NavigationContainer>
      {!user ? (
        <AuthNavigator />
      ) : role === 'delivery' ? (
        <MainNavigator delivery />
      ) : (
        <MainNavigator />
      )}
    </NavigationContainer>
  );
}
