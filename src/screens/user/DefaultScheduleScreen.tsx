import React from 'react';
import { View, ScrollView } from 'react-native';
import SubLayout from '../../layout/SubLayout';
import PickupTimeSelector from '../../components/PickupTimeSelector';
import AppButton from '../../components/ui/AppButton';
import { useNavigation } from '@react-navigation/native';
import { Alert } from 'react-native';
import { useAppSelector } from '../../store/hooks';

const DefaultScheduleScreen: React.FC = () => {
  const navigation = useNavigation<any>();
  const timeSlots = useAppSelector(state => state.timeSlots.list);

  const handleSave = () => {
    if (!timeSlots || timeSlots.length === 0) {
      Alert.alert('Lỗi', 'Vui lòng chọn ít nhất một ngày và khung giờ');
      return;
    }

    // Here you could save the default schedule to user preferences
    // For now, just show success and go back
    Alert.alert('Thành công', 'Đã lưu lịch thu gom mặc định');
    navigation.goBack();
  };

  return (
    <SubLayout
      title="Lịch thu gom mặc định"
      onBackPress={() => navigation.goBack()}
    >
      <ScrollView className="flex-1 px-6 pt-6">
        <PickupTimeSelector />
      </ScrollView>

      <View className="px-6 py-4">
        <AppButton title="Lưu lịch mặc định" onPress={handleSave} />
      </View>
    </SubLayout>
  );
};

export default DefaultScheduleScreen;
