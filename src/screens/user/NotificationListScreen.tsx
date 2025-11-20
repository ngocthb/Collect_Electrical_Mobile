import React from 'react';
import { View } from 'react-native';

import MainLayout from '../../layout/MainLayout';

interface NotificationListScreenProps {
  navigation: any;
}

const NotificationListScreen: React.FC<NotificationListScreenProps> = ({
  navigation,
}) => {
  return (
    <MainLayout headerTitle="Thông báo">
      <View className="flex-1 bg-gradient-to-b from-gray-50 to-white"></View>
    </MainLayout>
  );
};

export default NotificationListScreen;
