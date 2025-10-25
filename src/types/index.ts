export interface User {
  id: number;
  username: string;
  email: string;
  fullName: string;
  avatar: string | null;
  phone?: string;
}
