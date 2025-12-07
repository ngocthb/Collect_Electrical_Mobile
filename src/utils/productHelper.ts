export const COMPLETED_STATUSES = [
  'Tái chế',
  'Đã đóng gói',
  'Đã thu gom',
  'Nhập kho',
  'Đã đóng thùng',
];

export const ALL_KNOWN_STATUSES = [
  ...COMPLETED_STATUSES,
  'Chờ duyệt',
  'Đã duyệt',
  'Đã từ chối',
];

export const isCompletedStatus = (status?: string) => {
  if (!status) return false;
  return COMPLETED_STATUSES.map(s => s.toLowerCase()).includes(
    status.trim().toLowerCase(),
  );
};

export const getStatusLabel = (status?: string) => {
  return isCompletedStatus(status) ? 'Đã hoàn thành' : 'Chưa hoàn thành';
};

export const getStatusBgClass = (status?: string) => {
  return isCompletedStatus(status) ? 'bg-green-600' : 'bg-amber-500';
};

export const statusGroupOptions = [
  { value: '', label: 'Tất cả', color: 'gray' },
  { value: 'incomplete', label: 'Chưa hoàn thành', color: 'yellow' },
  { value: 'completed', label: 'Đã hoàn thành', color: 'green' },
];

export const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-400',
    blue: 'bg-blue-500',
    yellow: 'bg-amber-500',
    red: 'bg-red-500',
    green: 'bg-green-500',
    purple: 'bg-purple-500',
  };
  return colorMap[color] || 'bg-gray-400';
};

export const filterProductsByStatusGroup = (
  products: any[],
  statusGroup: string,
) => {
  if (!statusGroup) return products;

  return products.filter(p => {
    if (statusGroup === 'completed') {
      return isCompletedStatus(p.status);
    }

    if (statusGroup === 'incomplete') {
      return !isCompletedStatus(p.status);
    }

    return true; // Default case for 'Tất cả'
  });
};

export default {
  COMPLETED_STATUSES,
  ALL_KNOWN_STATUSES,
  isCompletedStatus,
  getStatusLabel,
  getStatusBgClass,

  statusGroupOptions,
  getColorClass,
  filterProductsByStatusGroup,
};
