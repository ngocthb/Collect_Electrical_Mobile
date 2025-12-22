import React from 'react';
import { View, ScrollView, RefreshControl, Platform } from 'react-native';
import { SafeAreaView } from 'react-native-safe-area-context';
import BackHeader from '../components/BackHeader';

const SubLayout: React.FC<SubLayoutProps> = ({
  title,
  onBackPress,
  children,
  rightComponent,
  onRefresh,
  noScroll,
  enableRefresh = true,
}) => {
  const [refreshing, setRefreshing] = React.useState(false);

  const handleRefresh = async () => {
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
      <BackHeader
        title={title}
        onBackPress={onBackPress}
        rightComponent={rightComponent}
      />

      {noScroll ? (
        <View style={{ flex: 1 }}>{children}</View>
      ) : (
        <ScrollView
          contentContainerStyle={{ flexGrow: 1 }}
          refreshControl={
            enableRefresh && onRefresh ? (
              <RefreshControl
                refreshing={refreshing}
                onRefresh={handleRefresh}
                tintColor="#e85a4f"
                colors={['#e85a4f']}
              />
            ) : undefined
          }
        >
          <View style={{ flex: 1 }}>{children}</View>
        </ScrollView>
      )}
    </SafeAreaView>
  );
};

export default SubLayout;
