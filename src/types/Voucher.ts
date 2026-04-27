export interface Voucher {
  voucherId: string;
  code: string;
  name: string;
  description: string;
  pointsToRedeem: number;
  imageUrl: string;
  status: string;
  startAt: string;
  endAt: string;
  value: number;
}
