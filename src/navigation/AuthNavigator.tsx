import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/DeliveryLoginScreen';
import UserLoginScreen from '../screens/auth/UserLoginScreen';
import DeliveryLoginScreen from '../screens/auth/DeliveryLoginScreen';

export type AuthStackParamList = {
  UserLogin: undefined;
  DeliveryLogin: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserLogin" component={UserLoginScreen} />
      <Stack.Screen name="DeliveryLogin" component={DeliveryLoginScreen} />
    </Stack.Navigator>
  );
}
