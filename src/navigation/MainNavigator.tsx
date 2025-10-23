import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';

import CreateRequestScreen from '../screens/user/CreateRequestScreen';
import AddressSelectionScreen from '../screens/user/AddressSelectionScreen';
import TimeSelectionScreen from '../screens/user/TimeSelectionScreen';
import MapboxLocationPicker from '../screens/user/MapboxLocationPicker';
import DeliveryOrdersScreen from '../screens/delivery/DeliveryOrdersScreen';
import DeliveryOrderMapScreen from '../screens/delivery/DeliveryOrderMapScreen';
import DeliveryRewardScreen from '../screens/user/DeliveryRewardScreen';
import DeliveryInfoScreen from '../screens/user/DeliveryInfoScreen';
import DeliveryConfirmScreen from '../screens/delivery/DeliveryConfirmScreen';
import UserConfirmScreen from '../screens/user/UserConfirmScreen';
import NotificationDetailScreen from '../screens/user/NotificationDetailScreen';
import DeliveryScanQrScreen from '../screens/delivery/DeliveryScanQrScreen';
import DeliveryRouteScreen from '../screens/delivery/DeliveryRouteScreen';

const Stack = createNativeStackNavigator();

export default function MainNavigator({ delivery }: { delivery?: boolean }) {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      {delivery ? (
        <>
          <Stack.Screen name="MainTabs" component={BottomTabs} />
          <Stack.Screen name="DeliveryOrder" component={DeliveryOrdersScreen} />
          <Stack.Screen
            name="DeliveryMapOrder"
            component={DeliveryOrderMapScreen}
          />
          <Stack.Screen
            name="DeliveryConfirm"
            component={DeliveryConfirmScreen}
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
