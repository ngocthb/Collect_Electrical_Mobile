export const mapStatusToIcon = (status: string) => {
  const s = String(status || '')
    .trim()
    .toLowerCase();
  // Vietnamese status mappings
  if (s === 'chờ duyệt') return 'clock';
  if (s === 'đã duyệt') return 'check-square';
  if (s === 'chờ thu gom') return 'calendar';
  if (s === 'đã thu gom' || s === 'đã lấy hàng') return 'package';
  if (s === 'nhập kho') return 'archive';
  if (s === 'đã đóng thùng' || s === 'đã đóng gói') return 'check-circle';
  if (s === 'đang vận chuyển') return 'truck';
  if (s === 'tái chế') return 'refresh-cw';
  // Fallbacks for English/internal codes
  switch (s) {
    case 'created':
      return 'plus-circle';
    case 'scheduled':
      return 'calendar';
    case 'collected':
      return 'package';
    case 'collection_failed':
      return 'x-circle';
    case 'at_warehouse':
      return 'archive';
    case 'packaged':
      return 'box';
    case 'in_transit':
      return 'truck';
    case 'at_recycling_unit':
      return 'refresh-cw';
    default:
      return 'info';
  }
};

export const mapStatusToLabel = (status: string) => {
  const s = String(status || '')
    .trim()
    .toLowerCase();
  if (s === 'chờ duyệt') return 'Chờ duyệt';
  if (s === 'chờ thu gom') return 'Chờ thu gom';
  if (s === 'đã thu gom') return 'Đã thu gom';
  if (s === 'nhập kho') return 'Nhập kho';
  if (s === 'đã đóng thùng' || s === 'đã đóng gói') return 'Đã đóng thùng';

  switch (s) {
    case 'created':
      return 'Yêu cầu đã tạo';
    case 'scheduled':
      return 'Đã lên lịch';
    case 'collected':
      return 'Lấy hàng thành công';
    case 'collection_failed':
      return 'Lấy hàng thất bại';
    case 'at_warehouse':
      return 'Đã đến kho';
    case 'packaged':
      return 'Đã đóng gói';
    case 'in_transit':
      return 'Đang vận chuyển';
    case 'at_recycling_unit':
      return 'Đã đến điểm tái chế';
    default:
      return status;
  }
};

export const parseDateTime = (item: any) => {
  try {
    if (!item || !item.date) return new Date(0);
    const parts = String(item.date).split('/'); // dd/mm/yyyy
    const d = Number(parts[0] || 0);
    const m = Number(parts[1] || 1) - 1;
    const y = Number(parts[2] || 1970);
    const tparts = String(item.time || '').split(':');
    const hh = Number(tparts[0] || 0);
    const mm = Number(tparts[1] || 0);
    return new Date(y, m, d, hh, mm);
  } catch (e) {
    return new Date(0);
  }
};

export const sortTimelineByDate = (data: any[]) => {
  return data.slice().sort((a: any, b: any) => {
    const da = parseDateTime(a).getTime();
    const db = parseDateTime(b).getTime();
    return db - da; // newest first
  });
};

export const mapTimelineData = (data: any[]) => {
  if (!Array.isArray(data)) return [];

  return sortTimelineByDate(data).map((it: any, idx: number) => ({
    id: `${idx}`,
    icon: mapStatusToIcon(it.status),
    title: mapStatusToLabel(it.status),
    subtitle: it.description,
    date: it.date,
    time: it.time,
  }));
};

export default {
  mapStatusToIcon,
  mapStatusToLabel,
  parseDateTime,
  sortTimelineByDate,
  mapTimelineData,
};
