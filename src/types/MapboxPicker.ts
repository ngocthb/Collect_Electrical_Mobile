export interface LocationData {
  name: string;
  latitude: number;
  longitude: number;
}

export interface MapboxFeature {
  id: string;
  place_name: string;
  center: [number, number];
  geometry: {
    coordinates: [number, number];
  };
}
