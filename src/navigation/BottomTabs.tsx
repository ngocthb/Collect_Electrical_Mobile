import React from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import IconOcticons from 'react-native-vector-icons/Octicons';
import IconFeature from 'react-native-vector-icons/Feather';
import HomeScreen from '../screens/user/HomeScreen';
import RequestScreen from '../screens/user/RequestScreen';
import NotificationsScreen from '../screens/delivery/NotificationsScreen';
import ProfileScreen from '../screens/user/ProfileScreen';
import { useAppSelector } from '../store/hooks';
import { createStackNavigator } from '@react-navigation/stack';
import HomeDeliveryScreen from '../screens/delivery/HomeDeliveryScreen';
import NotificationListScreen from '../screens/user/NotificationListScreen';

const Tab = createBottomTabNavigator();
const Stack = createStackNavigator();

export default function AppNavigator() {
  return (
    <Stack.Navigator screenOptions={{ headerShown: false }}>
      <Stack.Screen name="BottomTabs" component={BottomTabs} />
    </Stack.Navigator>
  );
}

function BottomTabs() {
  const { role } = useAppSelector(s => s.auth);

  const userTabs = (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#19CCA1',
        tabBarInactiveTintColor: '#818898',
        tabBarStyle: { backgroundColor: '#fff', height: 60 },
        tabBarIcon: ({ color, size }) => {
          const props = { color, size: size ?? 22 };
          switch (route.name) {
            case 'Trang chủ':
              return <IconOcticons name="home" {...props} />;
            case 'Yêu cầu':
              return <IconFeature name="archive" {...props} />;
            case 'Thông báo':
              return <IconFeature name="bell" {...props} />;
            case 'Tài khoản':
              return <IconFeature name="user" {...props} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Trang chủ" component={HomeScreen} />
      <Tab.Screen name="Yêu cầu" component={RequestScreen} />
      <Tab.Screen name="Thông báo" component={NotificationListScreen} />
      <Tab.Screen name="Tài khoản" component={ProfileScreen} />
    </Tab.Navigator>
  );

  const deliveryTabs = (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#19CCA1',
        tabBarInactiveTintColor: '#818898',
        tabBarStyle: { backgroundColor: '#fff', height: 60 },
        tabBarIcon: ({ color, size }) => {
          const props = { color, size: size ?? 22 };
          switch (route.name) {
            case 'Trang chủ':
              return <IconOcticons name="home" {...props} />;
            case 'Thông báo':
              return <IconFeature name="bell" {...props} />;
            case 'Tài khoản':
              return <IconFeature name="user" {...props} />;
            default:
              return null;
          }
        },
      })}
    >
      <Tab.Screen name="Trang chủ" component={HomeDeliveryScreen} />
      <Tab.Screen name="Thông báo" component={NotificationsScreen} />
      <Tab.Screen name="Tài khoản" component={ProfileScreen} />
    </Tab.Navigator>
  );

  return role === 'user' ? userTabs : deliveryTabs;
}
