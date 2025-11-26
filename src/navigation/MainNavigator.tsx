import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';

import CreateRequestScreen from '../screens/user/CreateRequestScreen';
import MapboxLocationPicker from '../screens/user/MapboxLocationPicker';
import DeliveryListScreen from '../screens/delivery/DeliveryListScreen';
import DeliveryMapScreen from '../screens/delivery/DeliveryMapScreen';
import DeliveryRewardScreen from '../screens/user/DeliveryRewardScreen';
import DeliveryInfoScreen from '../screens/user/DeliveryInfoScreen';

import DeliveryPhotoConfirmScreen from '../screens/delivery/DeliveryPhotoConfirmScreen';
import UserConfirmScreen from '../screens/user/UserConfirmScreen';
import NotificationDetailScreen from '../screens/user/NotificationDetailScreen';
import ProfileEditScreen from '../screens/common/ProfileEditScreen';
import DeliveryScanQrScreen from '../screens/delivery/DeliveryScanQrScreen';
import DeliveryRouteScreen from '../screens/delivery/DeliveryRouteScreen';

import DefaultAddressScreen from '../screens/user/DefaultAddressScreen';
import DefaultScheduleScreen from '../screens/user/DefaultScheduleScreen';
import ChangePasswordScreen from '../screens/common/ChangePasswordScreen';
import DeliveryCancelScreen from '../screens/delivery/DeliveryCancelScreen';
import WarehouseLocationScreen from '../screens/user/WarehouseLocationScreen';
import WalletScreen from '../screens/user/WalletScreen';
import VoucherScreen from '../screens/user/VoucherScreen';
import ShipmentDetailScreen from '../screens/user/ShipmentDetailScreen';
import DeliveringScreen from '../screens/user/DeliveringScreen';
import DeliveryDetailsScreen from '../screens/delivery/DeliveryDetailsScreen';
import DeliveryStatsScreen from '../screens/delivery/DeliveryStatsClean';
import MyQrScreen from '../screens/user/MyQrScreen';
import CancelledProductScreen from '../screens/user/CancelledProductScreen';
// @ts-ignore - no TypeScript declarations for this module
const {
  ZegoUIKitPrebuiltCallInCallScreen,
  ZegoUIKitPrebuiltCallWaitingScreen,
} = require('@zegocloud/zego-uikit-prebuilt-call-rn');

const Stack = createNativeStackNavigator();

export default function MainNavigator({ delivery }: { delivery?: boolean }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {delivery ? (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="DeliveryOrder" component={DeliveryListScreen} />
          <Stack.Screen name="DeliveryMapOrder" component={DeliveryMapScreen} />

          <Stack.Screen
            name="DeliveryPhotoConfirm"
            component={DeliveryPhotoConfirmScreen}
          />
          <Stack.Screen
            name="DeliveryCancel"
            component={DeliveryCancelScreen}
          />
          <Stack.Screen
            name="DeliveryCompleteScreen"
            component={DeliveryScanQrScreen}
          />
          <Stack.Screen name="DeliveryRoute" component={DeliveryRouteScreen} />
          <Stack.Screen
            name="DeliveryDetails"
            component={DeliveryDetailsScreen}
          />
          <Stack.Screen name="Statistics" component={DeliveryStatsScreen} />
          <Stack.Screen name="MyQr" component={MyQrScreen} />
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />

          <Stack.Screen
            name="DefaultAddress"
            component={DefaultAddressScreen}
          />
          <Stack.Screen
            name="DefaultSchedule"
            component={DefaultScheduleScreen}
          />

          <Stack.Screen
            name="MapboxLocationScreen"
            component={MapboxLocationPicker}
          />
          <Stack.Screen
            name="DeliveryReward"
            component={DeliveryRewardScreen}
          />
          <Stack.Screen name="DeliveryInfo" component={DeliveryInfoScreen} />
          <Stack.Screen name="UserConfirm" component={UserConfirmScreen} />

          <Stack.Screen
            name="UserNotificationDetail"
            component={NotificationDetailScreen}
          />
          <Stack.Screen
            name="WarehouseLocation"
            component={WarehouseLocationScreen}
          />
          <Stack.Screen name="Wallet" component={WalletScreen} />
          <Stack.Screen name="Voucher" component={VoucherScreen} />
          <Stack.Screen
            name="ShipmentDetail"
            component={ShipmentDetailScreen}
          />
          <Stack.Screen name="Delivering" component={DeliveringScreen} />
          <Stack.Screen name="MyQr" component={MyQrScreen} />
          <Stack.Screen
            name="CancelledProduct"
            component={CancelledProductScreen}
          />
        </>
      )}
      <Stack.Screen name="ChangePassword" component={ChangePasswordScreen} />
      <Stack.Screen name="EditProfile" component={ProfileEditScreen} />
      <Stack.Screen
        options={{ headerShown: false }}
        name="ZegoUIKitPrebuiltCallWaitingScreen"
        component={ZegoUIKitPrebuiltCallWaitingScreen}
      />
      <Stack.Screen
        options={{ headerShown: false }}
        // DO NOT change the name
        name="ZegoUIKitPrebuiltCallInCallScreen"
        component={ZegoUIKitPrebuiltCallInCallScreen}
      />
    </Stack.Navigator>
  );
}
