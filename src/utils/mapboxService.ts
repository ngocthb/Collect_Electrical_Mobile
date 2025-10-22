import { Platform, PermissionsAndroid, Alert, Linking } from 'react-native';
import Geolocation from 'react-native-geolocation-service';

export async function checkAndRequestLocationPermission() {
  if (Platform.OS === 'ios') {
    const status = await Geolocation.requestAuthorization('whenInUse');
    if (status === 'granted') {
      return true;
    } else if (status === 'denied') {
      Alert.alert(
        'Cần quyền truy cập vị trí',
        'Vui lòng bật quyền vị trí trong Cài đặt',
        [
          { text: 'Huỷ', style: 'cancel' },
          { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
        ],
      );
      return false;
    }
  } else {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Quyền truy cập vị trí',
          message:
            'Ứng dụng cần quyền truy cập vị trí của bạn để hiển thị trên bản đồ',
          buttonNeutral: 'Hỏi lại sau',
          buttonNegative: 'Từ chối',
          buttonPositive: 'Đồng ý',
        },
      );
      if (granted === PermissionsAndroid.RESULTS.GRANTED) {
        return true;
      } else {
        Alert.alert(
          'Cần quyền truy cập vị trí',
          'Vui lòng bật quyền vị trí trong Cài đặt',
          [
            { text: 'Huỷ', style: 'cancel' },
            { text: 'Mở Cài đặt', onPress: () => Linking.openSettings() },
          ],
        );
        return false;
      }
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  }
}
// Mapbox API service for geocoding and directions
const MAPBOX_TOKEN =
  'pk.eyJ1IjoibmdvY3RoYiIsImEiOiJjbWgxdmdzMWowcjliZjFzYjMwaDlqamJiIn0.qna079CtYSrSqD-YhlQArg';

export async function mapboxGeocode(
  query: string,
  proximity = '105.8342,21.0278',
) {
  const vietnamBbox = '102.14,8.18,109.46,23.39';
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${encodeURIComponent(
      query,
    )}.json?` +
    `access_token=${MAPBOX_TOKEN}` +
    `&country=VN` +
    `&bbox=${vietnamBbox}` +
    `&proximity=${proximity}` +
    `&language=vi` +
    `&limit=5` +
    `&types=poi,address,place,locality,neighborhood`;
  const response = await fetch(url);
  return response.json();
}

export async function mapboxReverseGeocode(
  longitude: number,
  latitude: number,
) {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
    `access_token=${MAPBOX_TOKEN}` +
    `&language=vi` +
    `&country=VN`;
  const response = await fetch(url);
  return response.json();
}

export async function mapboxDirections(start: string, end: string) {
  const url =
    `https://api.mapbox.com/directions/v5/mapbox/driving/${start};${end}?` +
    `access_token=${MAPBOX_TOKEN}` +
    `&geometries=geojson` +
    `&steps=true` +
    `&banner_instructions=true` +
    `&language=vi` +
    `&overview=full`;
  const response = await fetch(url);
  return response.json();
}
