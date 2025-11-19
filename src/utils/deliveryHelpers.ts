export const statusOptions = [
  { value: 'all', label: 'Tất cả', color: '#666' },
  { value: 'pending', label: 'Chờ giao', color: '#FF9800' },
  { value: 'failed', label: 'Thất bại', color: '#E53935' },
  { value: 'completed', label: 'Hoàn thành', color: '#4CAF50' },
];

export const mapStatus = (apiStatus: string | undefined) => {
  if (!apiStatus) return 'pending';
  switch (apiStatus) {
    case 'Hoàn thành':
      return 'completed';
    case 'Hủy bỏ':
      return 'failed';
    case 'Đang tiến hành':
    case 'Chưa bắt đầu':
      return 'pending';
    default:
      return 'pending';
  }
};

export const resolveStatus = (order: any) => {
  const s = order?.status;
  if (!s) return 'pending';
  if (s === 'pending' || s === 'completed' || s === 'failed') return s;
  return mapStatus(s);
};

export const getOrderId = (order: any) => order?.collectionRouteId ?? order?.id;
export const getOrderName = (order: any) => order?.sender?.name ?? 'NaN';
export const getOrderTime = (order: any) =>
  order?.actual_Time ?? order?.estimatedTime ?? order?.time ?? '';
export const getOrderAddress = (order: any) =>
  order?.address ?? order?.addressDetail ?? order?.addressLine ?? '';
export const getOrderDate = (order: any) => {
  if (!order) return new Date();
  if (order.date instanceof Date) return order.date as Date;
  if (order.collectionDate) return new Date(order.collectionDate);
  if (order.date) return new Date(order.date);
  return new Date();
};

export const getStatusColor = (status: string) => {
  const statusOption = statusOptions.find(opt => opt.value === status);
  return statusOption?.color || '#666';
};
