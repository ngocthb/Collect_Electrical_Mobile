import './global.css';
import './src/theme/font';

import { Provider } from 'react-redux';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';
import { useEffect } from 'react';
import { useAppDispatch } from './src/store/hooks';
import { bootstrapApp } from './src/services/bootstrapService';
import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
// @ts-ignore
import { ZegoCallInvitationDialog } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import toastConfig from './src/config/toast';
import Toast from 'react-native-toast-message';
import { useZegoService } from './src/hooks/useZegoService';
import 'react-native-url-polyfill/auto';
import './src/config/googleSignIn';

function AppContent() {
  // useZegoService();

  const dispatch = useAppDispatch();

  useEffect(() => {
    bootstrapApp(dispatch);
  }, [dispatch]);

  return (
    <>
      {/* <ZegoCallInvitationDialog /> */}
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
