export interface publicHoliday {
  publicHolidayId: string;
  startDate: string;
  endDate: string;
  name: string;
}

export interface systemConfig {
  systemConfigId: string;
  key: string;
  value: string;
  displayName: string;
  groupName: string;
  companyName: string | null;
  scpName: string | null;
  status: string | null;
}

export interface Option {
  id: string | number;
  label: string;
  value?: any;
}

export interface ServerTime {
  serverTime: string;
  serverDate: string;
}
