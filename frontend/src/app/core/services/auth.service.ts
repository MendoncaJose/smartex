import { Injectable, signal, computed, inject } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Router } from '@angular/router';
import { tap } from 'rxjs/operators';
import { environment } from '../../../environments/environment';
import { User } from '../models/user.model';

interface AuthResponse {
  accessToken: string;
}

interface JwtPayload {
  sub: number;
  email: string;
  exp: number;
}

const TOKEN_KEY = 'smartex_token';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);

  private readonly token = signal<string | null>(localStorage.getItem(TOKEN_KEY));

  readonly isAuthenticated = computed(() => {
    const t = this.token();
    if (!t) return false;
    try {
      const payload = this.decodeToken(t);
      return payload.exp * 1000 > Date.now();
    } catch {
      return false;
    }
  });

  readonly currentUser = computed<User | null>(() => {
    const t = this.token();
    if (!t || !this.isAuthenticated()) return null;
    try {
      const payload = this.decodeToken(t);
      return { id: payload.sub, email: payload.email };
    } catch {
      return null;
    }
  });

  getToken(): string | null {
    return this.token();
  }

  login(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/login`, { email, password })
      .pipe(tap((res) => this.setToken(res.accessToken)));
  }

  register(email: string, password: string) {
    return this.http
      .post<AuthResponse>(`${environment.apiUrl}/auth/register`, { email, password })
      .pipe(tap((res) => this.setToken(res.accessToken)));
  }

  logout() {
    this.token.set(null);
    localStorage.removeItem(TOKEN_KEY);
    this.router.navigate(['/login']);
  }

  private setToken(token: string) {
    localStorage.setItem(TOKEN_KEY, token);
    this.token.set(token);
  }

  private decodeToken(token: string): JwtPayload {
    const payload = token.split('.')[1];
    return JSON.parse(atob(payload));
  }
}
