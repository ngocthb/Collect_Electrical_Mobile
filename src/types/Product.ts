export interface ProductAttribute {
  attributeId: string;
  attributeName: string;
  optionId: string | null;
  optionName: string | null;
  value: string;
}

export interface ProductSchedule {
  dayName: string;
  pickUpDate: string;
  slots: {
    startTime: string;
    endTime: string;
  };
}

export interface ProductUser {
  userId: string;
  name: string;
  email: string;
  phone: string;
  avatar: string;
  role: string;
  smallCollectionPointId: number;
  collectionCompanyId: number;
  status: string;
}

export interface ProductDetail {
  productId: string;
  categoryId: string;
  categoryName: string;
  description: string;
  brandId: string;
  brandName: string;
  productImages: string[];
  status: string;
  estimatePoint: number;
  realPoints: number | null;
  rejectMessage: string | null;
  sender: ProductUser;
  collector: ProductUser | null;
  collectionRouterId: string | null;
  pickUpDate: string | null;
  estimatedTime: string | null;
  address: string;
  qrCode: string | null;
  isChecked: boolean;
  schedule: ProductSchedule[];
  attributes: ProductAttribute[];
}
export * from './Product';
