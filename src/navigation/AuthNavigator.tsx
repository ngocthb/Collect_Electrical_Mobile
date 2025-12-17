import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import UserLoginScreen from '../screens/auth/UserLoginScreen';
import DeliveryLoginScreen from '../screens/auth/DeliveryLoginScreen';
import VerifyScreen from '../screens/auth/VerifyScreen';
import ForgotPassScreen from '../screens/auth/ForgotPassScreen';
import ChangePassScreen from '../screens/auth/ChangePassScreen';

export type AuthStackParamList = {
  UserLogin: undefined;
  DeliveryLogin: undefined;
  Verify: { email: string };
  ForgotPass: undefined;
  ChangePass: undefined;
};

const Stack = createNativeStackNavigator<AuthStackParamList>();

export default function AuthNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="UserLogin" component={UserLoginScreen} />
      <Stack.Screen name="DeliveryLogin" component={DeliveryLoginScreen} />
      <Stack.Screen name="ForgotPass" component={ForgotPassScreen} />
      <Stack.Screen name="Verify" component={VerifyScreen} />
      <Stack.Screen name="ChangePass" component={ChangePassScreen} />
    </Stack.Navigator>
  );
}
