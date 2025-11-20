import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import Sidebar from '../components/Sidebar';
import Header from '../components/Header';
import { useNavigation } from '@react-navigation/native';
interface MainLayoutProps {
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  onRefresh?: () => Promise<void> | void;
  headerRightComponent?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  children,
  headerTitle,
  headerSubtitle,
  onRefresh,
  headerRightComponent,
}) => {
  const [isSidebarVisible, setSidebarVisible] = React.useState(false);
  const [refreshing, setRefreshing] = React.useState(false);

  const onPullRefresh = async () => {
    if (!onRefresh) return;
    try {
      setRefreshing(true);
      await onRefresh();
    } finally {
      setRefreshing(false);
    }
  };

  const toggleSidebar = () => {
    setSidebarVisible(!isSidebarVisible);
  };

  return (
    <View className="flex-1 bg-white">
      <Sidebar visible={isSidebarVisible} onClose={toggleSidebar} />
      <Header
        onMenuPress={toggleSidebar}
        title={headerTitle}
        subtitle={headerSubtitle}
        rightComponent={headerRightComponent}
      />
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onPullRefresh}
            tintColor="#19CCA1"
            colors={['#19CCA1']}
          />
        }
      >
        <View style={{ flex: 1 }}>{children}</View>
      </ScrollView>
    </View>
  );
};

export default MainLayout;
