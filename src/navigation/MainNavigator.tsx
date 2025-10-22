import React from 'react';
import { createNativeStackNavigator } from '@react-navigation/native-stack';
import BottomTabs from './BottomTabs';

import CreateRequestScreen from '../screens/user/CreateRequestScreen';
import AddressSelectionScreen from '../screens/user/AddressSelectionScreen';
import TimeSelectionScreen from '../screens/user/TimeSelectionScreen';
import MapboxLocationPicker from '../screens/user/MapboxLocationPicker';
import DeliveryOrdersScreen from '../screens/delivery/DeliveryOrdersScreen';
import DeliveryOrderMapScreen from '../screens/delivery/DeliveryOrderMapScreen';

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
        </>
      )}
    </Stack.Navigator>
  );
}
