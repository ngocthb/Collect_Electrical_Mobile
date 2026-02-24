import React from 'react';
import { View, ScrollView, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';

import Header from '../components/Header';

interface MainLayoutProps {
  icon?: string;
  children: React.ReactNode;
  headerTitle?: string;
  headerSubtitle?: string;
  hideHeader?: boolean;
  onRefresh?: () => Promise<void> | void;
  headerRightComponent?: React.ReactNode;
  useScrollView?: boolean; // Default true, set false if children has its own scrollable component
}

const MainLayout: React.FC<MainLayoutProps> = ({
  icon,
  children,
  headerTitle,
  headerSubtitle,
  hideHeader,
  onRefresh,
  headerRightComponent,
  useScrollView = true,
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
    <SafeAreaView
      edges={Platform.OS === 'ios' ? ['top'] : []}
      style={{ flex: 1, backgroundColor: '#F9FAFB' }}
    >
      {!hideHeader && (
        <Header
          icon={icon}
          title={headerTitle}
          subtitle={headerSubtitle}
          rightComponent={headerRightComponent}
        />
      )}

      {useScrollView ? (
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
      ) : (
        <View style={{ flex: 1 }}>{children}</View>
      )}
    </SafeAreaView>
  );
};

export default MainLayout;
