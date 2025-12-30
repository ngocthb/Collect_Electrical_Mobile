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

export interface LocationIQAddress {
  name?: string;
  road?: string;
  neighbourhood?: string;
  suburb?: string;
  city?: string;
  county?: string;
  state?: string;
  country?: string;
  country_code?: string;
}

export interface LocationIQResult {
  place_id: string;
  osm_id: string;
  osm_type: 'node' | 'way' | 'relation';

  lat: string;
  lon: string;

  display_name: string;
  importance?: number;

  boundingbox?: [string, string, string, string];

  address: LocationIQAddress;

  licence?: string;
}
