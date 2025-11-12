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

// backward-compatible alias
export const statusColorClass = getStatusBadgeClass;

export default { getStatusBadgeClass, statusColorClass };
