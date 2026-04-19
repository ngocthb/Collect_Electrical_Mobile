export function isValidSystemQRCode(qr: string): boolean {
  if (!/^[0-9]{13}$/.test(qr)) return false;
  const qrNum = Number(qr);

  // Đầu ngày hôm qua
  const startOfYesterday = new Date();
  startOfYesterday.setHours(0, 0, 0, 0);
  startOfYesterday.setDate(startOfYesterday.getDate() - 1);

  // Cuối ngày hôm nay
  const endOfToday = new Date();
  endOfToday.setHours(23, 59, 59, 999);

  return qrNum >= startOfYesterday.getTime() && qrNum <= endOfToday.getTime();
}
