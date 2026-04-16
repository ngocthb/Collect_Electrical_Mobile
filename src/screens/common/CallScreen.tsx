// src/screens/CallScreen.tsx
import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function CallScreen({ route }: any) {
  const { roomID } = route.params;

  useEffect(() => {
    console.log('🔥 JOIN ROOM:', roomID);

    // 👉 tạm thời log trước
    // sau này m gọi join Zego hoặc SDK ở đây
  }, [roomID]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Calling room: {roomID}</Text>
    </View>
  );
}