import { HttpClient } from '@angular/common/http';
import { Injectable, computed, inject, signal } from '@angular/core';
import { Observable, map, of, switchMap, tap } from 'rxjs';

import { environment } from '../../../environments/environment';
import { AuthUser, LoginCredentials, LoginResponse, MeResponse } from './auth.models';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly tokenKey = 'fudi_lead_lab_token';
  private readonly userKey = 'fudi_lead_lab_user';

  readonly token = signal<string | null>(this.readToken());
  readonly currentUser = signal<AuthUser | null>(this.readUser());
  readonly isAuthenticated = computed(() => Boolean(this.token()));

  login(credentials: LoginCredentials): Observable<AuthUser> {
    const payload = {
      username: credentials.email,
      password: credentials.password,
    };

    return this.http.post<LoginResponse>(`${environment.apiBaseUrl}/auth/login`, payload).pipe(
      switchMap((response) => {
        const token = this.extractToken(response);

        if (!token) {
          throw new Error('La respuesta de login no incluyo token de acceso.');
        }

        this.persistToken(token);

        const user = response.user ?? response.data?.user ?? null;
        if (user) {
          const normalizedUser = this.normalizeUser(user);
          this.persistUser(normalizedUser);
          return of(normalizedUser);
        }

        return this.loadCurrentUser();
      }),
    );
  }

  loadCurrentUser(): Observable<AuthUser> {
    return this.http.get<AuthUser | MeResponse>(`${environment.apiBaseUrl}/auth/me`).pipe(
      map((response) => this.normalizeUser(this.extractUser(response))),
      tap((user) => this.persistUser(user)),
    );
  }

  logout(): void {
    this.clearSession();
  }

  clearSession(): void {
    this.token.set(null);
    this.currentUser.set(null);

    if (this.hasStorage()) {
      localStorage.removeItem(this.tokenKey);
      localStorage.removeItem(this.userKey);
    }
  }

  private persistToken(token: string): void {
    this.token.set(token);

    if (this.hasStorage()) {
      localStorage.setItem(this.tokenKey, token);
    }
  }

  private persistUser(user: AuthUser): void {
    this.currentUser.set(user);

    if (this.hasStorage()) {
      localStorage.setItem(this.userKey, JSON.stringify(user));
    }
  }

  private readToken(): string | null {
    if (!this.hasStorage()) {
      return null;
    }

    return localStorage.getItem(this.tokenKey);
  }

  private readUser(): AuthUser | null {
    if (!this.hasStorage()) {
      return null;
    }

    const storedUser = localStorage.getItem(this.userKey);
    if (!storedUser) {
      return null;
    }

    try {
      return JSON.parse(storedUser) as AuthUser;
    } catch {
      localStorage.removeItem(this.userKey);
      return null;
    }
  }

  private hasStorage(): boolean {
    return typeof localStorage !== 'undefined';
  }

  private extractToken(response: LoginResponse): string | null {
    return (
      response.token ??
      response.accessToken ??
      response.access_token ??
      response.data?.token ??
      response.data?.accessToken ??
      response.data?.access_token ??
      null
    );
  }

  private extractUser(response: AuthUser | MeResponse): AuthUser {
    if (this.isMeResponse(response)) {
      if (response.user) {
        return response.user;
      }

      if (response.data) {
        if (this.hasNestedUser(response.data) && response.data.user) {
          return response.data.user;
        }

        return response.data as AuthUser;
      }
    }

    return response as AuthUser;
  }

  private isMeResponse(response: AuthUser | MeResponse): response is MeResponse {
    return 'user' in response || 'data' in response;
  }

  private hasNestedUser(data: AuthUser | { user?: AuthUser }): data is { user?: AuthUser } {
    return 'user' in data;
  }

  private normalizeUser(user: AuthUser): AuthUser {
    const primaryRole = user.role ?? user.roles?.[0];
    return {
      ...user,
      name: user.name ?? user.display_name ?? user.username ?? user.email,
      email: user.email ?? user.username,
      role: primaryRole,
    };
  }
}
