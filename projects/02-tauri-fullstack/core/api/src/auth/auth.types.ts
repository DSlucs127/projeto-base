export type UserRole = 'admin' | 'member' | 'guest';

export interface AuthenticatedUser {
  id: string;
  role: UserRole;
  permissions: string[];
}

export interface AccessTokenPayload {
  sub: string;
  role: UserRole;
  permissions: string[];
}

export interface RefreshTokenPayload {
  sub: string;
  sid: string;
  type: 'refresh';
}

export interface UserView extends AuthenticatedUser {
  email: string;
  displayName: string | null;
}

export interface AuthResult {
  accessToken: string;
  refreshToken: string;
  refreshExpiresAt: Date;
  user: UserView;
}
