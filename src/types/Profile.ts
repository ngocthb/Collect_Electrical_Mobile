export interface Profile {
  userId: string;
  name: string;
  email: string;
  phone: string;
  address: string;
  avatar: string;
  iat: number;
  ing: number;
  role: string;
  smallCollectionPointId: number;
  points: number;
}

export interface DeliveryLoginResponse {
  accessToken: string;
  isFirstLogin: boolean;
}
