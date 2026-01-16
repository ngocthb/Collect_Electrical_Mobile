export const COMPLETED_STATUSES = [
  'Nhập kho',
  'Đã thu gom',
  'Đã đóng thùng',
  'Tái chế',
];

export const IN_PROGRESS_STATUSES = [
  'Chờ phân kho',
  'Chờ gom nhóm',
  'Chờ thu gom',
];

export const PENDING_STATUSES = ['Chờ Duyệt'];
export const REJECTED_STATUSES = ['Đã Từ Chối', 'Đã hủy'];

export const ALL_KNOWN_STATUSES = [
  ...COMPLETED_STATUSES,
  ...IN_PROGRESS_STATUSES,
  ...PENDING_STATUSES,
  ...REJECTED_STATUSES,
];

export const isCompletedStatus = (status?: string) => {
  if (!status) return false;
  return COMPLETED_STATUSES.map(s => s.toLowerCase()).includes(
    status.trim().toLowerCase(),
  );
};

export const isInProgressStatus = (status?: string) => {
  if (!status) return false;
  return IN_PROGRESS_STATUSES.map(s => s.toLowerCase()).includes(
    status.trim().toLowerCase(),
  );
};

export const isPendingStatus = (status?: string) => {
  if (!status) return false;
  return PENDING_STATUSES.map(s => s.toLowerCase()).includes(
    status.trim().toLowerCase(),
  );
};

export const isRejectedStatus = (status?: string) => {
  if (!status) return false;
  return REJECTED_STATUSES.map(s => s.toLowerCase()).includes(
    status.trim().toLowerCase(),
  );
};

export const isCanCancelProduct = (status?: string) => {
  if (!status) return false;
  const lowerStatus = status.trim().toLowerCase();
  return lowerStatus === 'chờ phân kho' || lowerStatus === 'chờ duyệt';
};

export const getStatusLabel = (status?: string) => {
  if (isInProgressStatus(status)) {
    return 'Đang xử lý';
  } else if (isPendingStatus(status)) {
    return 'Chờ duyệt';
  } else if (isRejectedStatus(status)) {
    return status?.toLowerCase() === 'đã từ chối' ? 'Từ chối' : 'Đã hủy';
  }
  return 'Hoàn thành';
};

export const getStatusBgClass = (status?: string) => {
  if (isInProgressStatus(status)) {
    return 'bg-amber-500';
  } else if (isPendingStatus(status)) {
    return 'bg-blue-500';
  } else if (isRejectedStatus(status)) {
    return 'bg-red-500';
  }
  return 'bg-green-500';
};

export const statusGroupOptions = [
  { value: 'incomplete', label: 'Đang xử lý', color: 'yellow' },
  { value: 'completed', label: 'Hoàn thành', color: 'green' },
  { value: 'rejected', label: 'Từ chối / hủy', color: 'red' },
];

export const getColorClass = (color: string) => {
  const colorMap: Record<string, string> = {
    gray: 'bg-gray-200',
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
      return isInProgressStatus(p.status) || isPendingStatus(p.status);
    }
    if (statusGroup === 'rejected') {
      return isRejectedStatus(p.status);
    }

    return true; // Default case for 'Tất cả'
  });
};

export const shortDayLabel = (code: string) => {
  if (!code) return '';
  if (/^T[2-7]$/.test(code) || code === 'CN') return code;
  if (code === 'Thứ 2') return 'T2';
  if (code === 'Thứ 3') return 'T3';
  if (code === 'Thứ 4') return 'T4';
  if (code === 'Thứ 5') return 'T5';
  if (code === 'Thứ 6') return 'T6';
  if (code === 'Thứ 7') return 'T7';
  if (code === 'Chủ Nhật' || code === 'Chủ nhật') return 'CN';
  return String(code).slice(0, 3);
};

export const groupTimeSlots = (slots: Record<string, string[]>) => {
  if (!slots) return null;
  const entries = Object.entries(slots).filter(
    ([, v]) => Array.isArray(v) && v.length > 0,
  );
  if (entries.length === 0) return null;

  const groups = new Map<string, { times: string[]; days: string[] }>();

  entries.forEach(([day, times]) => {
    const key = Array.isArray(times) ? times.join('|') : String(times);
    if (groups.has(key)) {
      groups.get(key)!.days.push(day);
    } else {
      groups.set(key, {
        times: Array.isArray(times) ? times : [times],
        days: [day],
      });
    }
  });

  const grouped = Array.from(groups.values());
  const totalDays = entries.length;
  const allDaysSameGroup = totalDays === 7 && grouped.length === 1;

  return { grouped, allDaysSameGroup };
};

export const parseUnitFromName = (name?: string) => {
  if (!name) return '';
  const m = name.match(/\(([^)]+)\)/);
  return m && m[1] ? m[1].trim() : '';
};

export const parseProductAttributes = (attributes: any[]) => {
  if (!attributes || attributes.length === 0) return null;

  const normalize = (s: string) => (s || '').toLowerCase();
  const findByName = (keywords: string[]) =>
    attributes.find(a =>
      keywords.some(k => normalize(a.attributeName).includes(k)),
    );

  const lengthAttr = findByName(['chiều dài', 'chiều dai', 'length']);
  const widthAttr = findByName(['chiều rộng', 'chiều rong', 'width']);
  const heightAttr = findByName(['chiều cao', 'height']);

  const otherAttrs = attributes.filter(
    a => ![lengthAttr, widthAttr, heightAttr].includes(a),
  );

  const canRenderBox = lengthAttr && widthAttr && heightAttr;
  const unit =
    (lengthAttr && lengthAttr.unit) ||
    (widthAttr && widthAttr.unit) ||
    (heightAttr && heightAttr.unit) ||
    parseUnitFromName(lengthAttr?.attributeName) ||
    parseUnitFromName(widthAttr?.attributeName) ||
    parseUnitFromName(heightAttr?.attributeName) ||
    '';

  return {
    lengthAttr,
    widthAttr,
    heightAttr,
    otherAttrs,
    canRenderBox,
    unit,
  };
};

export default {
  COMPLETED_STATUSES,
  ALL_KNOWN_STATUSES,
  statusGroupOptions,
  isCompletedStatus,
  getStatusLabel,
  getStatusBgClass,
  getColorClass,
  filterProductsByStatusGroup,
  shortDayLabel,
  groupTimeSlots,
  parseUnitFromName,
  parseProductAttributes,
};
