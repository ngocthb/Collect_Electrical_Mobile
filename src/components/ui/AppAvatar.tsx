import React from 'react';
import { View, Text, Image, StyleSheet } from 'react-native';

type Props = {
  name?: string | null;
  uri?: string | null;
  size?: number;
  style?: any;
};

const getUserInitial = (fullName?: string | null) => {
  if (!fullName) return '?';
  const parts = fullName.trim().split(/\s+/);
  const given = parts.length > 0 ? parts[parts.length - 1] : fullName;
  return given && given.charAt(0)
    ? given.charAt(0).toUpperCase()
    : fullName.charAt(0).toUpperCase();
};

const AppAvatar: React.FC<Props> = ({ name, uri, size = 80, style }) => {
  const initial = getUserInitial(name);
  const borderRadius = size / 2;

  if (uri) {
    return (
      <Image
        source={{ uri }}
        style={[
          { width: size, height: size, borderRadius },
          styles.image,
          style,
        ]}
        resizeMode="cover"
      />
    );
  }

  return (
    <View
      style={[
        { width: size, height: size, borderRadius, backgroundColor: '#E98074' },
        styles.container,
        style,
      ]}
    >
      <Text
        style={{
          color: '#fff',
          fontWeight: '700',
          fontSize: Math.round(size / 2.5),
        }}
      >
        {initial}
      </Text>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    alignItems: 'center',
    justifyContent: 'center',
  },
  image: {
    // shadow styles can't be applied on Android via Image directly; keep them local when needed
  },
});

export default AppAvatar;
