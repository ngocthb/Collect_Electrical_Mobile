export const REPORT_STATUS = {
  PROCESSING: 'Đang xử lý',
  RESOLVED: 'Đã xử lý',
};

export const STATUS_COLORS: { [key: string]: string } = {
  [REPORT_STATUS.PROCESSING]: '#F59E0B',
  [REPORT_STATUS.RESOLVED]: '#10B981',
};

export const isProcessingStatus = (status?: string) => {
  if (!status) return false;
  return status.trim().toLowerCase() === REPORT_STATUS.PROCESSING.toLowerCase();
};

export const isResolvedStatus = (status?: string) => {
  if (!status) return false;
  return status.trim().toLowerCase() === REPORT_STATUS.RESOLVED.toLowerCase();
};

export const getStatusColor = (status?: string) => {
  if (!status) return '#999';
  return STATUS_COLORS[status] || '#999';
};

export const formatReportDate = (dateString: string): string => {
  if (!dateString) return '';
  const date = new Date(dateString);
  return date.toLocaleDateString('vi-VN', {
    day: '2-digit',
    month: '2-digit',
    year: 'numeric',
  });
};

export const filterReportsByType = (
  reports: any[],
  selectedType: string,
): any[] => {
  if (!selectedType) return reports;
  return reports.filter(r => r.reportType === selectedType);
};

export const sortReportsByDate = (reports: any[]): any[] => {
  return [...reports].sort((a, b) => {
    const dateA = new Date(a.createdAt).getTime();
    const dateB = new Date(b.createdAt).getTime();
    return dateB - dateA;
  });
};

export default {
  REPORT_STATUS,
  STATUS_COLORS,
  isProcessingStatus,
  isResolvedStatus,
  getStatusColor,
  formatReportDate,
  filterReportsByType,
  sortReportsByDate,
};
