import React from 'react';
import { View, Text } from 'react-native';
import MainLayout from '../../layout/MainLayout';

export default function NotificationsScreen() {
  return (
    <MainLayout>
      <View className="flex-1 items-center justify-center">
        <Text className="text-blue-600 text-lg font-bold">
          🔔 Notifications Screen
        </Text>
      </View>
    </MainLayout>
  );
}
