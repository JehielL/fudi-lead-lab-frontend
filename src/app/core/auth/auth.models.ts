export interface LoginCredentials {
  email: string;
  password: string;
}

export interface AuthUser {
  id?: string | number;
  username?: string;
  display_name?: string;
  roles?: string[];
  name?: string;
  email?: string;
  role?: string;
  organization?: string;
}

export interface LoginResponse {
  token?: string;
  accessToken?: string;
  access_token?: string;
  user?: AuthUser;
  data?: {
    token?: string;
    accessToken?: string;
    access_token?: string;
    user?: AuthUser;
  };
}

export interface MeResponse {
  user?: AuthUser;
  data?: AuthUser | { user?: AuthUser };
}
