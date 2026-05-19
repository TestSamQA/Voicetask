export enum UserRole { Member = 0, Admin = 1 }

export interface AuthUser {
  userId: string;
  username: string;
  email: string;
  role: UserRole;
  accessToken: string;
}

export interface LoginRequest {
  email: string;
  password: string;
}

export interface RegisterRequest {
  username: string;
  email: string;
  password: string;
}

export interface AuthResponse {
  accessToken: string;
  userId: string;
  username: string;
  email: string;
  role: UserRole;
}

export interface UserSummary {
  id: string;
  username: string;
  email: string;
  role: UserRole;
  createdAt: string;
}
