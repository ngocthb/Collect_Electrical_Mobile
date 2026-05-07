import React, { useEffect } from 'react';
import { View, Text } from 'react-native';

export default function CallScreen({ route }: any) {
  const { roomID } = route.params;

  useEffect(() => {
    console.log('JOIN ROOM:', roomID);
  }, [roomID]);

  return (
    <View style={{ flex: 1, justifyContent: 'center', alignItems: 'center' }}>
      <Text>Calling room: {roomID}</Text>
    </View>
  );
}
