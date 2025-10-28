import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';

import CreateRequestScreen from '../screens/user/CreateRequestScreen';
import AddressSelectionScreen from '../screens/user/AddressSelectionScreen';
import TimeSelectionScreen from '../screens/user/TimeSelectionScreen';
import MapboxLocationPicker from '../screens/user/MapboxLocationPicker';
import DeliveryListScreen from '../screens/delivery/DeliveryListScreen';
import DeliveryMapScreen from '../screens/delivery/DeliveryMapScreen';
import DeliveryRewardScreen from '../screens/user/DeliveryRewardScreen';
import DeliveryInfoScreen from '../screens/user/DeliveryInfoScreen';
import DeliveryQrScreen from '../screens/delivery/DeliveryQrScreen';
import DeliveryPhotoConfirmScreen from '../screens/delivery/DeliveryPhotoConfirmScreen';
import UserConfirmScreen from '../screens/user/UserConfirmScreen';
import NotificationDetailScreen from '../screens/user/NotificationDetailScreen';
import DeliveryScanQrScreen from '../screens/delivery/DeliveryScanQrScreen';
import DeliveryRouteScreen from '../screens/delivery/DeliveryRouteScreen';
import CreateAddressScreen from '../screens/user/CreateAddressScreen';
import DeliveryCancelScreen from '../screens/delivery/DeliveryCancelScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator({ delivery }: { delivery?: boolean }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {delivery ? (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="DeliveryOrder" component={DeliveryListScreen} />
          <Stack.Screen name="DeliveryMapOrder" component={DeliveryMapScreen} />
          <Stack.Screen name="DeliveryConfirm" component={DeliveryQrScreen} />
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
        </>
      ) : (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="CreateRequest" component={CreateRequestScreen} />
          <Stack.Screen name="CreateAddress" component={CreateAddressScreen} />
          <Stack.Screen
            name="AddressSelectionScreen"
            component={AddressSelectionScreen}
          />
          <Stack.Screen
            name="TimeSelectionScreen"
            component={TimeSelectionScreen}
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
            name="UserNotificationDetails"
            component={NotificationDetailScreen}
          />
          <Stack.Screen
            name="UserNotificationDetail"
            component={NotificationDetailScreen}
          />
        </>
      )}
    </Stack.Navigator>
  );
}
