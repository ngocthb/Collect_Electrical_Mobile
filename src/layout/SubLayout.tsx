import React from 'react';
import { View } from 'react-native';
import BackHeader from '../components/BackHeader';

interface SubLayoutProps {
  title: string;
  onBackPress: () => void;
  children: React.ReactNode;
}

const SubLayout: React.FC<SubLayoutProps> = ({
  title,
  onBackPress,
  children,
}) => {
  return (
    <View className="flex-1 bg-white">
      <BackHeader title={title} onBackPress={onBackPress} />
      <View className="flex-1">{children}</View>
    </View>
  );
};

export default SubLayout;
