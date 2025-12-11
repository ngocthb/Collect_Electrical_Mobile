export type Warehouse = {
  id: string;
  name: string;
  address: string;
  latitude: number;
  longitude: number;
  openTime: string;
  status: string;
  companyId: string;
  rating: number;
  distanceMeters?: number | 0;
  distanceText?: string | '';
};
