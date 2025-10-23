// Search location (geocoding)
export async function searchLocation(
  query: string,
  currentLocation?: [number, number],
) {
  if (!query.trim()) {
    return { features: [] };
  }
  const vietnamBbox = '102.14,8.18,109.46,23.39';
  const proximity = currentLocation
    ? `${currentLocation[0]},${currentLocation[1]}`
    : '105.8342,21.0278';
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
  return await response.json();
}

// Reverse geocode to get place name
export async function reverseGeocode(longitude: number, latitude: number) {
  const url =
    `https://api.mapbox.com/geocoding/v5/mapbox.places/${longitude},${latitude}.json?` +
    `access_token=${MAPBOX_TOKEN}` +
    `&language=vi` +
    `&country=VN`;
  const response = await fetch(url);
  const data = await response.json();
  const placeName = data.features?.[0]?.place_name || 'Vị trí đã chọn';
  return {
    name: placeName,
    latitude,
    longitude,
  };
}
// Trả về dữ liệu route cho turn-by-turn navigation
import type { LineString } from 'geojson';
export interface NavigationStep {
  instruction: string;
  distance: number;
  duration: number;
  maneuver: {
    type: string;
    modifier?: string;
    location: [number, number];
  };
}

export interface RouteData {
  distance: number;
  duration: number;
  geometry: LineString;
  steps: NavigationStep[];
}

export async function getDirections(
  currentLocation: [number, number],
  markerCoordinate: [number, number],
): Promise<RouteData | null> {
  const startCoords = `${currentLocation[0]},${currentLocation[1]}`;
  const endCoords = `${markerCoordinate[0]},${markerCoordinate[1]}`;
  const data = await mapboxDirections(startCoords, endCoords);
  if (data.routes && data.routes.length > 0) {
    const route = data.routes[0];
    const steps: NavigationStep[] = route.legs[0].steps.map((step: any) => ({
      instruction: step.maneuver.instruction,
      distance: step.distance,
      duration: step.duration,
      maneuver: {
        type: step.maneuver.type,
        modifier: step.maneuver.modifier,
        location: step.maneuver.location,
      },
    }));
    return {
      distance: route.distance,
      duration: route.duration,
      geometry: route.geometry,
      steps,
    };
  }
  return null;
}
// Lấy vị trí hiện tại, trả về Promise<[longitude, latitude]>
export function getCurrentLocation(): Promise<[number, number]> {
  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;
        resolve([longitude, latitude]);
      },
      error => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 20000,
        maximumAge: 1000,
        showLocationDialog: true,
      },
    );
  });
}
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
