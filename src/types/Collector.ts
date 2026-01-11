export interface Collector {
  collectorId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  smallCollectionPointId: string;
}
export interface Sender {
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  smallCollectionPointId: string | null;
  collectionCompanyId: string | null;
}

export interface CollectionRoute {
  collectionRouteId: string;
  postId: string;
  productId: string;
  brandName: string;
  subCategoryName: string;

  collector: Collector;
  sender: Sender;

  collectionDate: string; // YYYY-MM-DD
  estimatedTime: string; // HH:mm:ss
  actual_Time: string | null; // HH:mm:ss | null

  confirmImages: string[];
  pickUpItemImages: string[];

  licensePlate: string;
  address: string;

  iat: number;
  ing: number;

  distanceKm: number;
  status: string;
}

export interface CollectionRouteResponse {
  data: CollectionRoute[];
  serverTime: string;
  serverDate: string;
}

export interface CollectionRouteWithDistance extends CollectionRoute {
  distanceMeters: number;
  distanceText: string;
}
