export interface Address {
  userAddressId: string;
  userId: string;
  address: string;
  iat: number;
  ing: number;
  isDefault: boolean;
}

export * from './Address';
