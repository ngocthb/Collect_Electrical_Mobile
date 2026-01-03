import { Platform, PermissionsAndroid, Linking } from 'react-native';
import toast from 'react-native-toast-message';
import Geolocation from 'react-native-geolocation-service';
import type { LineString } from 'geojson';
import type { ResolvedLocation } from '../types/MapboxPicker';
import Config from '../config/env';
import axios from 'axios';

const MAPBOX_TOKEN = Config.MAPBOX_ACCESS_TOKEN;
const OPEN_MAP_TOKEN = Config.OPEN_MAP_TOKEN;

export async function searchLocation(query: string) {
  if (!query.trim() || query.length < 2) {
    return [];
  }

  const url = 'https://mapapis.openmap.vn/v1/place/autocomplete';

  const params = {
    input: query,
    location: '10.8231,106.6297', // ưu tiên HCM
    radius: 80, // bao HCM + BD + DN
    admin_v2: true, // địa giới mới
    apikey: OPEN_MAP_TOKEN,
  };

  const res = await axios.get(url, { params });
  const results = res.data?.predictions ?? [];

  return results;
}

export async function resolvePlace(placeId: string) {
  try {
    const res = await axios.get('https://mapapis.openmap.vn/v1/place', {
      params: {
        ids: placeId,
        admin_v2: true,
        format: 'google',
        apikey: OPEN_MAP_TOKEN,
      },
    });

    const result = res.data?.result;
    return {
      name: result.formatted_address,
      latitude: result.geometry.location.lat,
      longitude: result.geometry.location.lng,
    };
  } catch (e) {
    console.warn('resolvePlace failed', e);
    return null;
  }
}

export async function reverseGeocode(longitude: number, latitude: number) {
  try {
    const url = 'https://mapapis.openmap.vn/v1/geocode/reverse';

    const params = {
      latlng: `${latitude},${longitude}`, // ⚠️ lat,lng
      admin_v2: true,
      apikey: OPEN_MAP_TOKEN,
    };

    const res = await axios.get(url, { params });
    const data = res.data;
    const result = data?.results?.[0];

    if (!result) {
      return {
        name: 'Vị trí đã chọn',
        latitude,
        longitude,
      };
    }

    return {
      name: result.formatted_address || 'Vị trí đã chọn',
      latitude,
      longitude,
    };
  } catch (error) {
    return {
      name: 'Vị trí đã chọn',
      latitude,
      longitude,
    };
  }
}
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

export async function checkAndRequestLocationPermission() {
  if (Platform.OS === 'ios') {
    const status = await Geolocation.requestAuthorization('whenInUse');
    if (status === 'granted') {
      return true;
    } else if (status === 'denied') {
      toast.show({
        type: 'confirm',
        text1: 'Cần quyền truy cập vị trí',
        text2: 'Vui lòng bật quyền vị trí trong Cài đặt',
        autoHide: false,
        props: {
          button1: 'Huỷ',
          button2: 'Mở Cài đặt',
          onCancel: () => {
            toast.hide();
          },
          onConfirm: () => Linking.openSettings(),
        },
      });
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
        toast.show({
          type: 'confirm',
          text1: 'Cần quyền truy cập vị trí',
          text2: 'Vui lòng bật quyền vị trí trong Cài đặt',
          autoHide: false,
          props: {
            button1: 'Huỷ',
            button2: 'Mở Cài đặt',
            onCancel: () => {
              toast.hide();
            },
            onConfirm: () => Linking.openSettings(),
          },
        });
        return false;
      }
    } catch (err) {
      console.warn('Permission error:', err);
      return false;
    }
  }
}

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

// Calculate distance between two coordinates using Haversine formula
export function calculateDistance(
  lat1: number,
  lon1: number,
  lat2: number,
  lon2: number,
): number {
  const R = 6371e3; // Earth's radius in meters
  const φ1 = (lat1 * Math.PI) / 180;
  const φ2 = (lat2 * Math.PI) / 180;
  const Δφ = ((lat2 - lat1) * Math.PI) / 180;
  const Δλ = ((lon2 - lon1) * Math.PI) / 180;

  const a =
    Math.sin(Δφ / 2) * Math.sin(Δφ / 2) +
    Math.cos(φ1) * Math.cos(φ2) * Math.sin(Δλ / 2) * Math.sin(Δλ / 2);
  const c = 2 * Math.atan2(Math.sqrt(a), Math.sqrt(1 - a));

  return R * c; // Distance in meters
}

// Request location permission
export async function requestLocationPermission(): Promise<boolean> {
  if (Platform.OS === 'android') {
    try {
      const granted = await PermissionsAndroid.request(
        PermissionsAndroid.PERMISSIONS.ACCESS_FINE_LOCATION,
        {
          title: 'Quyền truy cập vị trí',
          message: 'Ứng dụng cần truy cập vị trí để tính khoảng cách giao hàng',
          buttonNeutral: 'Hỏi lại sau',
          buttonNegative: 'Hủy',
          buttonPositive: 'Đồng ý',
        },
      );
      return granted === PermissionsAndroid.RESULTS.GRANTED;
    } catch (err) {
      console.warn(err);
      return false;
    }
  }
  return true;
}

// Watch current location and calculate distance to target
export function watchCurrentLocationWithDistance(
  targetLat: number,
  targetLng: number,
  onUpdate: (location: { lat: number; lng: number }, distance: number) => void,
  onError?: (error: any) => void,
): number {
  const watchId = Geolocation.watchPosition(
    position => {
      const { latitude, longitude } = position.coords;
      const distance = calculateDistance(
        latitude,
        longitude,
        targetLat,
        targetLng,
      );
      onUpdate({ lat: latitude, lng: longitude }, distance);
    },
    error => {
      console.error('Location error:', error);
      if (onError) onError(error);
    },
    {
      enableHighAccuracy: true,
      distanceFilter: 10, // Update every 10 meters
      interval: 5000, // Update every 5 seconds
      fastestInterval: 2000,
    },
  );
  return watchId;
}

// Get current location once and calculate distance to target
export async function getCurrentLocationDistance(
  targetLat: number,
  targetLng: number,
): Promise<{ location: { lat: number; lng: number }; distance: number }> {
  const hasPermission = await requestLocationPermission();

  if (!hasPermission) {
    throw new Error('Location permission denied');
  }

  return new Promise((resolve, reject) => {
    Geolocation.getCurrentPosition(
      position => {
        const { latitude, longitude } = position.coords;

        const distance = calculateDistance(
          latitude,
          longitude,
          targetLat,
          targetLng,
        );
        resolve({ location: { lat: latitude, lng: longitude }, distance });
      },
      error => {
        reject(error);
      },
      {
        enableHighAccuracy: true,
        timeout: 15000,
        maximumAge: 60000,
        showLocationDialog: true,
      },
    );
  });
}
