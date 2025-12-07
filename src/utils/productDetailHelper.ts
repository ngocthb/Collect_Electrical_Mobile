export const getStatusBadgeClass = (status: string) => {
  switch ((status || '').toLowerCase()) {
    case 'đã từ chối':
      return 'bg-red-500';
    case 'chờ duyệt':
      return 'bg-yellow-400';
    case 'đã duyệt':
      return 'bg-blue-500';
    case 'đã hoàn thành':
      return 'bg-green-500';
    default:
      return 'bg-gray-400';
  }
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

// backward-compatible alias
export const statusColorClass = getStatusBadgeClass;

export default {
  getStatusBadgeClass,
  statusColorClass,
  shortDayLabel,
  groupTimeSlots,
  parseUnitFromName,
  parseProductAttributes,
};
