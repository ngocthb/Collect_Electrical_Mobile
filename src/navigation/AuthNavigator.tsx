import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import LoginScreen from '../screens/auth/LoginScreen';
import SimpleLoginScreen from '../screens/auth/SimpleLoginScreen';

export type AuthStackParamList = {
  SimpleLogin: undefined;
  Login: undefined;
  Register: undefined;
  Verify: { email: string };
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="SimpleLogin" component={SimpleLoginScreen} />
      <Stack.Screen name="Login" component={LoginScreen} />
    </Stack.Navigator>
  );
}
