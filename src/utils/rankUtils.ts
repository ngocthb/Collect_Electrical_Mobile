export type RankName = 'dong' | 'bac' | 'vang' | 'kimcuong';

export type RankUpPayload = {
  fromRank: RankName;
  toRank: RankName;
};

export const PENDING_RANK_UP_KEY = 'pending_rank_up_payload';

const RANK_ORDER: Record<RankName, number> = {
  dong: 1,
  bac: 2,
  vang: 3,
  kimcuong: 4,
};

export const normalizeRank = (value?: string | null): RankName | null => {
  if (!value) return null;

  const normalized = value
    .toString()
    .trim()
    .toLowerCase()
    .replace(/đ/g, 'd')
    .normalize('NFD')
    .replace(/[\u0300-\u036f]/g, '')
    .replace(/\s+/g, '');

  if (normalized.includes('dong') || normalized === 'bronze') return 'dong';
  if (normalized.includes('bac') || normalized === 'silver') return 'bac';
  if (normalized.includes('vang') || normalized === 'gold') return 'vang';
  if (normalized.includes('kimcuong') || normalized === 'diamond') {
    return 'kimcuong';
  }

  return null;
};

export const isRankUp = (fromRank: RankName, toRank: RankName) => {
  return RANK_ORDER[toRank] > RANK_ORDER[fromRank];
};

const pickString = (value: unknown): string | undefined => {
  return typeof value === 'string' ? value : undefined;
};

export const getRankUpPayload = (
  data?: Record<string, unknown>,
): RankUpPayload | null => {
  if (!data) return null;

  const fromRaw =
    pickString(data.fromRank) ??
    pickString(data.oldRankName) ??
    pickString(data.previousRank) ??
    pickString(data.oldRank) ??
    pickString(data.rankFrom) ??
    pickString(data.beforeRank);
  const toRaw =
    pickString(data.toRank) ??
    pickString(data.newRankName) ??
    pickString(data.currentRank) ??
    pickString(data.newRank) ??
    pickString(data.rankTo) ??
    pickString(data.afterRank);

  const fromRank = normalizeRank(fromRaw);
  const toRank = normalizeRank(toRaw);

  if (!fromRank || !toRank || fromRank === toRank) return null;

  return { fromRank, toRank };
};
