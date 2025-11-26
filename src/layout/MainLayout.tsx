import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';

import Header from '../components/Header';

interface MainLayoutProps {
  icon?: string;
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  hideHeader?: boolean;
  onRefresh?: () => Promise<void> | void;
  headerRightComponent?: React.ReactNode;
}

const MainLayout: React.FC<MainLayoutProps> = ({
  icon,
  children,
  headerTitle,
  headerSubtitle,
  hideHeader,
  onRefresh,
  headerRightComponent,
}) => {
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

  return (
    <View className="flex-1 bg-white">
      {!hideHeader && (
        <Header
          icon={icon}
          title={headerTitle}
          subtitle={headerSubtitle}
          rightComponent={headerRightComponent}
        />
      )}
      <ScrollView
        contentContainerStyle={{ flexGrow: 1 }}
        refreshControl={
          <RefreshControl
            refreshing={refreshing}
            onRefresh={onPullRefresh}
            tintColor="#e85a4f"
            colors={['#e85a4f']}
          />
        }
      >
        <View style={{ flex: 1 }}>{children}</View>
      </ScrollView>
    </View>
  );
};

export default MainLayout;
