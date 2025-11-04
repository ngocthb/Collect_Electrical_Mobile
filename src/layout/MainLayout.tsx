import React from 'react';
import { View } from 'react-native';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';

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
  const [isSidebarVisible, setSidebarVisible] = React.useState(false);

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <View className="flex-1 bg-white">
      <Sidebar visible={isSidebarVisible} onClose={toggleSidebar} />
      <Header
        onMenuPress={toggleSidebar}
        onNotificationPress={() => {}}
        title={headerTitle}
        subtitle={headerSubtitle}
      />
      <View className="flex-1">{children}</View>
    </View>
  );
};

export default MainLayout;
