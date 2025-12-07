import React, { useState } from 'react';
import { createBottomTabNavigator } from '@react-navigation/bottom-tabs';
import CenterPlusButton from '../components/ui/CenterPlusButton';
import { useNavigation } from '@react-navigation/native';
import IconOcticons from 'react-native-vector-icons/Octicons';
import IconFeature from 'react-native-vector-icons/Feather';
import HomeScreen from '../screens/user/HomeScreen';
import ProductScreen from '../screens/user/ProductScreen';
import DeliveryNotificationsScreen from '../screens/delivery/DeliveryNotificationsScreen';
import ProfileScreen from '../screens/common/ProfileScreen';
import { useAppSelector } from '../store/hooks';
import { createStackNavigator } from '@react-navigation/stack';
import DeliveryHomeScreen from '../screens/delivery/DeliveryHomeScreen';
import NotificationScreen from '../screens/user/NotificationScreen';
import CategoryPickerModal from '../components/CategoryPickerModal';

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
  const user = useAppSelector(s => s.auth);
  const role = user?.user?.role.toLocaleLowerCase();
  const navigation = useNavigation<any>();
  const [catModalVisible, setCatModalVisible] = useState(false);

  const userTabs = (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#e85a4f',
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
      <Tab.Screen name="Yêu cầu" component={ProductScreen} />
      <Tab.Screen
        name="TaoYeuCau"
        component={HomeScreen}
        options={{
          tabBarLabel: '',
          tabBarButton: (props: any) => (
            <CenterPlusButton
              {...props}
              onPress={() => setCatModalVisible(true)}
            />
          ),
        }}
      />
      <Tab.Screen name="Thông báo" component={NotificationScreen} />
      <Tab.Screen name="Tài khoản" component={ProfileScreen} />
    </Tab.Navigator>
  );

  const deliveryTabs = (
    <Tab.Navigator
      screenOptions={({ route }) => ({
        headerShown: false,
        tabBarActiveTintColor: '#e85a4f',
        tabBarInactiveTintColor: '#818898',
        tabBarStyle: { height: 60, backgroundColor: '#fff' },

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
      <Tab.Screen name="Trang chủ" component={DeliveryHomeScreen} />
      <Tab.Screen name="Thông báo" component={DeliveryNotificationsScreen} />
      <Tab.Screen name="Tài khoản" component={ProfileScreen} />
    </Tab.Navigator>
  );

  return (
    <>
      {role === 'user' ? userTabs : deliveryTabs}
      <CategoryPickerModal
        visible={catModalVisible}
        onClose={() => setCatModalVisible(false)}
        onConfirm={cat => {
          setCatModalVisible(false);

          navigation.navigate('CreateRequest', { parentCategoryId: cat.id });
        }}
      />
    </>
  );
}
