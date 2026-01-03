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
export interface OpenMapAddressComponent {
  long_name: string;
  short_name?: string;
  types: string[];
}
export interface OpenMapGeometry {
  location: {
    lat: number;
    lng: number;
  };
}

export interface OpenMapResult {
  place_id: string;

  name?: string;

  address: string; // địa chỉ ngắn
  formatted_address: string; // địa chỉ đầy đủ để hiển thị

  address_components: OpenMapAddressComponent[];

  geometry: OpenMapGeometry;

  types?: string[];

  zipcode?: string;

  forcodes?: string;
}
export interface OpenMapTerm {
  offset: number;
  value: string;
}
export interface OpenMapStructuredFormatting {
  main_text: string;
  main_text_matched_substrings: OpenMapMatchedSubstring[];

  secondary_text: string;
  secondary_text_matched_substrings: OpenMapMatchedSubstring[];
}
export interface OpenMapMatchedSubstring {
  offset: number;
  length: number;
}

export interface OpenMapAutocompleteResult {
  place_id: string;

  description: string;

  structured_formatting: OpenMapStructuredFormatting;

  terms: OpenMapTerm[];

  types?: string[];

  distance_meters?: number | null;

  has_child?: boolean;

  matched_substrings?: OpenMapMatchedSubstring[];
}

export interface AutocompleteItem {
  place_id: string;
  description: string;
}

export interface ResolvedLocation {
  place_id: string;
  name: string;
  latitude: number;
  longitude: number;
  address: string;
}
