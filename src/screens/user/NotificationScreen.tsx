import React from 'react';
import { View, Text } from 'react-native';

import MainLayout from '../../layout/MainLayout';

interface NotificationScreenProps {
  navigation: any;
}

const NotificationScreen: React.FC<NotificationScreenProps> = ({
  navigation,
}) => {
  return (
    <MainLayout headerTitle="Thông báo">
      <View className="flex-1 bg-gradient-to-b from-gray-50 to-white">
        <Text className="text-center mt-4 text-gray-500">
          Chức năng thông báo đang được phát triển.
        </Text>
      </View>
    </MainLayout>
  );
};

export default NotificationScreen;
