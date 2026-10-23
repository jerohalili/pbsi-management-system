export const Roles = {
  admin: 'admin',
  teacher: 'teacher',
  student: 'student',
  parent: 'parent',
} as const;

export type UserRole = typeof Roles[keyof typeof Roles];

export interface AuthUser {
  id: string;
  email: string;
  role: UserRole;
}

export interface JwtPayload {
  sub: string;
  email: string;
  role: UserRole;
}

export interface Pagination {
  page?: number;
  limit?: number;
  sortBy?: string;
  sortOrder?: 'asc' | 'desc';
}
