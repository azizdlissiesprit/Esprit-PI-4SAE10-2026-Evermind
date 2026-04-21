import { UserType } from './enums';

export interface AdminUser {
  userId: number;
  firstName: string;
  lastName: string;
  email: string;
  phoneNumber: string;
  userType: UserType;
  active: boolean;
  banned: boolean;
  createdAt: string;
  lastLogin: string | null;
}

export interface UserStats {
  totalUsers: number;
  activeUsers: number;
  bannedUsers: number;
  admins: number;
  aidants: number;
  medecins: number;
  responsables: number;
}

export interface UserFilters {
  search?: string;
  userType?: UserType;
}
