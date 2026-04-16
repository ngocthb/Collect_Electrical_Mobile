/**
 * @format
 */

import { AppRegistry } from 'react-native';
import AsyncStorage from '@react-native-async-storage/async-storage';
import messaging from '@react-native-firebase/messaging';
import App from './App';
import { name as appName } from './app.json';
import ZegoUIKitPrebuiltCallService from '@zegocloud/zego-uikit-prebuilt-call-rn';
import * as ZIM from 'zego-zim-react-native';
import * as ZPNs from 'zego-zpns-react-native';
import { getRankUpPayload, PENDING_RANK_UP_KEY } from './src/utils/rankUtils';

messaging().setBackgroundMessageHandler(async remoteMessage => {
  const data = remoteMessage?.data;
  if (!data || data.type !== 'CO2_SAVED') return;

  const rankUpPayload = getRankUpPayload(data);
  if (!rankUpPayload) return;

  await AsyncStorage.setItem(
    PENDING_RANK_UP_KEY,
    JSON.stringify(rankUpPayload),
  );
});

// ZegoUIKitPrebuiltCallService.useSystemCallingUI([ZIM, ZPNs]);
AppRegistry.registerComponent(appName, () => App);
