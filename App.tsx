import './global.css';
import './src/theme/font';

import { Provider } from 'react-redux';
import { store } from './src/store';
import RootNavigator from './src/navigation/RootNavigator';

import { useAppDispatch, useAppSelector } from './src/store/hooks';

import { GestureHandlerRootView } from 'react-native-gesture-handler';
import { NavigationContainer } from '@react-navigation/native';
// @ts-ignore
import { ZegoCallInvitationDialog } from '@zegocloud/zego-uikit-prebuilt-call-rn';
import toastConfig from './src/config/toast';
import Toast from 'react-native-toast-message';
import { useZegoService } from './src/hooks/useZegoService';
import 'react-native-url-polyfill/auto';
import './src/config/googleSignIn';
import { useCallback, useEffect, useState } from 'react';
import { bootstrapApp } from './src/services/bootstrapService';
import { navigationRef } from './src/navigation/navigationService';
import { useNotificationHandler } from './src/hooks/useNotificationHandler';
import RankUpModal from './src/components/RankUpModal';
import { useRankUpModal } from './src/hooks/useRankUpModal';

function AppContent({ activeRouteName }: { activeRouteName: string }) {
  const dispatch = useAppDispatch();
  const { user } = useAppSelector(s => s.auth);
  const canShowRankModal =
    activeRouteName !== '' && activeRouteName !== 'CreateRequest';
  const { rankUpModal, showRankUpModal, closeRankUpModal } = useRankUpModal(
    user?.userId,
    canShowRankModal,
  );

  useZegoService();
  useNotificationHandler(showRankUpModal);

  useEffect(() => {
    bootstrapApp(dispatch);
  }, [dispatch]);

  return (
    <>
      <ZegoCallInvitationDialog />
      <RootNavigator />
      <RankUpModal
        visible={rankUpModal.visible}
        fromRank={rankUpModal.fromRank}
        toRank={rankUpModal.toRank}
        onClose={closeRankUpModal}
      />
    </>
  );
}

export default function App() {
  const [activeRouteName, setActiveRouteName] = useState('');

  const updateActiveRoute = useCallback(() => {
    const currentRoute = navigationRef.getCurrentRoute();
    setActiveRouteName(currentRoute?.name ?? '');
  }, []);

  return (
    <GestureHandlerRootView style={{ flex: 1 }}>
      <Provider store={store}>
        <NavigationContainer
          ref={navigationRef}
          onReady={updateActiveRoute}
          onStateChange={updateActiveRoute}
        >
          <AppContent activeRouteName={activeRouteName} />
        </NavigationContainer>
        <Toast config={toastConfig} />
      </Provider>
    </GestureHandlerRootView>
  );
}
