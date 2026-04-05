export interface ProductInfo {
  address: string; // Địa điểm thu gom
  brandName: string; // Tên thương hiệu
  categoryName: string; // Danh mục sản phẩm
  description: string; // Mô tả / tình trạng
  images: string[]; // Danh sách URL hình ảnh
  status: string; // Trạng thái hiện tại (VD: "Tái chế")
  points: number; // Điểm tích lũy (nếu có)
  collectionRouteId: string; // ID tuyến thu gom (nếu có)
}

export interface TimelineItem {
  status: string; // Trạng thái (VD: "Đang vận chuyển")
  description: string; // Mô tả chi tiết
  date: string; // Ngày (DD/MM/YYYY)
  time: string; // Giờ (HH:mm)
}

export interface TimelineDetails {
  productInfo: ProductInfo;
  timeline: TimelineItem[];
}
