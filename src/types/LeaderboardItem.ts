export interface LeaderboardItem {
  rankPosition: number;
  userId: string;
  userName: string;
  avatar: string | null;
  totalCo2Saved: number;
  rankName?: string;
  rankIcon?: string;
}
