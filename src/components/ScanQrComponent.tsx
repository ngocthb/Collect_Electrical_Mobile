import React, { useState } from 'react';
import { View, Text, StyleSheet } from 'react-native';
import { RNCamera } from 'react-native-camera';
import AppButton from './ui/AppButton';

const ScanQrComponent = () => {
  const [scanned, setScanned] = useState(false);
  const [qrId, setQrId] = useState<string | null>(null);

  const handleBarCodeRead = (e: { data: string }) => {
    if (!scanned) {
      setScanned(true);
      setQrId(e.data);
    }
  };

  return (
    <View style={styles.container}>
      <Text style={styles.title}>Quét mã QR</Text>
      <View style={styles.scannerBox}>
        {!scanned ? (
          <RNCamera
            style={StyleSheet.absoluteFillObject}
            onBarCodeRead={handleBarCodeRead}
            captureAudio={false}
          />
        ) : (
          <View style={styles.resultBox}>
            <Text style={styles.resultText}>ID QR: {qrId}</Text>
            <AppButton
              title="Quét lại"
              onPress={() => {
                setScanned(false);
                setQrId(null);
              }}
            />
          </View>
        )}
      </View>
    </View>
  );
};

const styles = StyleSheet.create({
  container: {
    flex: 1,
    justifyContent: 'center',
    alignItems: 'center',
    backgroundColor: '#F9FAFB',
  },
  title: { fontSize: 20, fontWeight: 'bold', marginBottom: 16 },
  scannerBox: {
    width: 280,
    height: 280,
    borderRadius: 16,
    overflow: 'hidden',
    backgroundColor: '#FFF',
    justifyContent: 'center',
    alignItems: 'center',
    shadowColor: '#000',
    shadowOpacity: 0.1,
    shadowRadius: 8,
  },
  resultBox: { flex: 1, justifyContent: 'center', alignItems: 'center' },
  resultText: {
    fontSize: 18,
    fontWeight: '600',
    marginBottom: 16,
    color: '#059669',
  },
});

export default ScanQrComponent;
