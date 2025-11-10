import './global.css';
import './src/theme/font';
import React, { useEffect, useRef } from 'react';
import { Provider } from 'react-redux';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
import { ZegoCallInvitationDialog } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import toastConfig from './src/config/toast';
import Toast from 'react-native-toast-message';
import { useZegoService } from './src/hooks/useZegoService';
import configureGoogleSignIn from './src/config/googleSignIn';
import 'react-native-url-polyfill/auto';

// Configure Google Sign-In on app startup
configureGoogleSignIn();

function AppContent() {
  useZegoService();

  return (
    <>
      <ZegoCallInvitationDialog />
      <RootNavigator />
    </>
  );
}

export default function App() {
  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <NavigationContainer>
          <AppContent />
        </NavigationContainer>
        <Toast config={toastConfig} />
      </Provider>
    </GestureHandlerRootView>
  );
}
