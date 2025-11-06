import React from 'react';
import { View } from 'react-native';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
interface MainLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  headerTitle,
  headerSubtitle,
}) => {
  const navigation = useNavigation<any>();
  const [isSidebarVisible, setSidebarVisible] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  const handleNotification = () => {
    // Navigate directly to the Notifications tab.
    // Some navigator stacks register the bottom tabs under different parent names,
    // navigating by the tab name is more robust.
    navigation.navigate('Thông báo');
  };

  return (
    <View className="flex-1 bg-white">
      <Sidebar visible={isSidebarVisible} onClose={toggleSidebar} />
      <Header
        onMenuPress={toggleSidebar}
        onNotificationPress={handleNotification}
        title={headerTitle}
        subtitle={headerSubtitle}
      />
      <View className="flex-1">{children}</View>
    </View>
  );
};

export default MainLayout;
