export interface ProductInfo {
  address: string;
  brandName: string;
  categoryName: string;
  description: string;
  images: string[];
  status: string;
  points: number;
  collectionRouteId: string;
}

export interface TimelineItem {
  status: string;
  description: string;
  date: string;
  time: string;
}

export interface TimelineDetails {
  productInfo: ProductInfo;
  timeline: TimelineItem[];
}
