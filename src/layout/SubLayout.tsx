import React from 'react';
import { View, ScrollView, RefreshControl } from 'react-native';
import BackHeader from '../components/BackHeader';

interface SubLayoutProps {
  title: string;
  onBackPress: () => void;
  children: React.ReactNode;
  rightComponent?: React.ReactNode;
  onRefresh?: () => Promise<void> | void;
  noScroll?: boolean;
}

const SubLayout: React.FC<SubLayoutProps> = ({
  title,
  onBackPress,
  children,
  rightComponent,
  onRefresh,
  noScroll,
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
    <View className="flex-1 bg-white">
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
            <RefreshControl
              refreshing={refreshing}
              onRefresh={handleRefresh}
              tintColor="#19CCA1"
              colors={['#19CCA1']}
            />
          }
        >
          <View className="flex-1">{children}</View>
        </ScrollView>
      )}
    </View>
  );
};

export default SubLayout;
