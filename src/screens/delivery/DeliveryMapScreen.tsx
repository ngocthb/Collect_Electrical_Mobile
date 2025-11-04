import React, { useState, useRef } from 'react';
import { View, Text, Animated, PanResponder, Dimensions } from 'react-native';

import type { LocationData } from '../../types/MapboxPicker';
import {
  getCurrentLocation,
  checkAndRequestLocationPermission,
  reverseGeocode,
  getDirections,
} from '../../services/mapboxService';
import SubLayout from '../../layout/SubLayout';
import { useNavigation, useRoute } from '@react-navigation/native';
import MapboxTurnbyturn from '../../components/MapboxTurnbyturn';
import routeService from '../../services/routeService';

let DeliveryMapPanel: any = null;
try {
  const mod = require('../../components/DeliveryMapPanel');
  DeliveryMapPanel = mod && (mod.default || mod);
} catch (e) {
  console.warn('Could not load DeliveryMapPanel component', e);
}

const { height: SCREEN_HEIGHT } = Dimensions.get('window');
const MIN_HEIGHT = SCREEN_HEIGHT * 0.25;
const MAX_HEIGHT = SCREEN_HEIGHT * 0.65;

const DeliveryMapScreen = () => {
  const navigation = useNavigation<any>();
  const route = useRoute<any>();
  const [isExpanded, setIsExpanded] = useState(false);
  const panelHeight = useRef(new Animated.Value(MIN_HEIGHT)).current;

  const routeRequest = route.params?.request ?? route.params?.product ?? null;
  const routeIdParam = route.params?.requestId ?? route.params?.id ?? null;

  const [fetchedRequest, setFetchedRequest] = useState<any | null>(null);

  React.useEffect(() => {
    let mounted = true;
    const id =
      routeIdParam ??
      routeRequest?.collectionRouteId ??
      routeRequest?.id ??
      null;
    if (!id) return;

    (async () => {
      try {
        const res = await routeService.getDetail(id);
        if (!mounted) return;
        setFetchedRequest(res ?? null);
      } catch (e) {
        console.warn('Failed to fetch route detail', e);
      }
    })();

    return () => {
      mounted = false;
    };
  }, [routeRequest, routeIdParam]);

  // Memoize normalized request so it doesn't change reference on every render
  const normalizedRequest = React.useMemo(() => {
    const source = fetchedRequest ?? routeRequest;
    if (!source) return null;
    return {
      ...source,
      sender: source.sender ?? null,
    };
    // only recreate when fetchedRequest or routeRequest changes
  }, [fetchedRequest, routeRequest]);

  // current device location (longitude, latitude)
  const [currentLocation, setCurrentLocation] = useState<
    [number, number] | null
  >(null);
  const [currentLocationName, setCurrentLocationName] = useState<string | null>(
    null,
  );

  const [routeDistanceMeters, setRouteDistanceMeters] = useState<number | null>(
    null,
  );
  const [routeDurationSec, setRouteDurationSec] = useState<number | null>(null);
  const [isRouteLoading, setIsRouteLoading] = useState(false);

  const pickupLocation: LocationData = {
    name: normalizedRequest?.sender?.address,
    latitude: normalizedRequest?.sender?.iat ?? 0,
    longitude: normalizedRequest?.sender?.ing ?? 0,
  };

  // Try to fetch current device location on mount
  React.useEffect(() => {
    let mounted = true;
    (async () => {
      try {
        const ok = await checkAndRequestLocationPermission();
        if (!ok) return;
        const coords = await getCurrentLocation();
        if (!mounted) return;
        setCurrentLocation(coords);
        try {
          const rev = await reverseGeocode(coords[0], coords[1]);
          if (mounted) setCurrentLocationName(rev?.name ?? 'Vị trí của bạn');
        } catch (e) {
          // ignore reverse geocode errors
        }
      } catch (e) {
        console.warn('Could not get current location', e);
      }
    })();
    return () => {
      mounted = false;
    };
  }, []);

  // derive pickup coords (memoized primitives) to use as effect dependencies
  const pickupLat = normalizedRequest?.sender?.iat;
  const pickupLng = normalizedRequest?.sender?.ing;

  // avoid repeated calculations when same start+end were used last time
  const lastRouteKeyRef = React.useRef<string | null>(null);

  // Compute driving distance and duration when we have both current location and pickup location
  React.useEffect(() => {
    let mounted = true;
    if (!isExpanded) return; // only compute when panel is expanded to avoid frequent background updates
    if (!currentLocation || !pickupLat || !pickupLng) return;

    const routeKey = `${currentLocation[0]},${currentLocation[1]}|${pickupLng},${pickupLat}`;
    if (lastRouteKeyRef.current === routeKey) return; // already computed for these coords

    (async () => {
      setIsRouteLoading(true);
      try {
        // getDirections expects [lon, lat] tuples
        const route = await getDirections(currentLocation, [
          pickupLng,
          pickupLat,
        ]);
        if (!mounted) return;
        if (route) {
          setRouteDistanceMeters(route.distance ?? null);
          setRouteDurationSec(route.duration ?? null);
          lastRouteKeyRef.current = routeKey;
        }
      } catch (e) {
        console.warn('Failed to compute route', e);
      } finally {
        if (mounted) setIsRouteLoading(false);
      }
    })();

    return () => {
      mounted = false;
    };
    // only run when currentLocation, pickup coords or panel expansion changes
  }, [currentLocation, pickupLat, pickupLng, isExpanded]);

  const formatDistance = (meters: number | null) => {
    if (meters == null) return '--';
    if (meters >= 1000) return `${(meters / 1000).toFixed(1)} km`;
    return `${Math.round(meters)} m`;
  };

  const formatDuration = (seconds: number | null) => {
    if (seconds == null) return '--';
    const mins = Math.ceil(seconds / 60);
    if (mins < 60) return `${mins} phút`;
    const hrs = Math.floor(mins / 60);
    const rem = mins % 60;
    return `${hrs} giờ ${rem} phút`;
  };

  const panResponder = useRef(
    PanResponder.create({
      onStartShouldSetPanResponder: () => true,
      onMoveShouldSetPanResponder: (_, gestureState) => {
        return Math.abs(gestureState.dy) > 5;
      },
      onPanResponderMove: (_, gestureState) => {
        const newHeight = isExpanded
          ? MAX_HEIGHT - gestureState.dy
          : MIN_HEIGHT - gestureState.dy;

        if (newHeight >= MIN_HEIGHT && newHeight <= MAX_HEIGHT) {
          panelHeight.setValue(newHeight);
        }
      },
      onPanResponderRelease: (_, gestureState) => {
        if (gestureState.dy < -50 && !isExpanded) {
          expandPanel();
        } else if (gestureState.dy > 50 && isExpanded) {
          collapsePanel();
        } else {
          Animated.spring(panelHeight, {
            toValue: isExpanded ? MAX_HEIGHT : MIN_HEIGHT,
            useNativeDriver: false,
          }).start();
        }
      },
    }),
  ).current;

  const expandPanel = () => {
    setIsExpanded(true);
    Animated.spring(panelHeight, {
      toValue: MAX_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  const collapsePanel = () => {
    setIsExpanded(false);
    Animated.spring(panelHeight, {
      toValue: MIN_HEIGHT,
      useNativeDriver: false,
      tension: 50,
      friction: 8,
    }).start();
  };

  return (
    <SubLayout
      title="Chi tiết đơn hàng"
      onBackPress={() => navigation.goBack()}
    >
      <View className="flex-1 bg-white">
        {/* Map */}
        <View className="flex-1">
          <MapboxTurnbyturn
            initialLocation={
              currentLocation
                ? {
                    name: currentLocationName ?? 'Vị trí của bạn',
                    latitude: currentLocation[1],
                    longitude: currentLocation[0],
                  }
                : pickupLocation
            }
            onLocationSelect={() => {}}
            searchPlaceholder=""
            confirmButtonText=""
            showMyLocationButton={false}
          />
        </View>

        {/* Draggable Bottom Panel */}
        <Animated.View
          className="absolute bottom-0 left-0 right-0 bg-white rounded-t-3xl shadow-lg"
          style={{
            height: panelHeight,
            shadowColor: '#000',
            shadowOffset: { width: 0, height: -4 },
            shadowOpacity: 0.1,
            shadowRadius: 8,
            elevation: 10,
          }}
        >
          {/* Drag Handle */}
          <View
            className="items-center py-3 px-5"
            {...panResponder.panHandlers}
          >
            <View className="w-10 h-1 bg-gray-300 rounded-sm" />
          </View>

          {DeliveryMapPanel ? (
            <DeliveryMapPanel
              normalizedRequest={normalizedRequest}
              pickupLocationName={pickupLocation.name}
              isExpanded={isExpanded}
              isRouteLoading={isRouteLoading}
              distanceText={formatDistance(routeDistanceMeters)}
              durationText={formatDuration(routeDurationSec)}
              onCall={() => {}}
              onMessage={() => {}}
              onConfirm={() =>
                navigation.navigate('DeliveryConfirm', {
                  requestId: normalizedRequest?.collectionRouteId,
                })
              }
              onReject={() =>
                navigation.navigate('DeliveryCancel', {
                  requestId: normalizedRequest?.collectionRouteId,
                })
              }
            />
          ) : (
            <View className="px-5 pb-5">
              <Text className="text-sm text-gray-500">
                Không thể tải giao diện
              </Text>
            </View>
          )}
        </Animated.View>
      </View>
    </SubLayout>
  );
};

export default DeliveryMapScreen;
