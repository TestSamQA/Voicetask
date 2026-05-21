import { Injectable, computed, inject, signal } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, tap } from 'rxjs';
import { Router } from '@angular/router';
import { environment } from '../../../environments/environment';
import { AuthResponse, AuthUser, LoginRequest, RegisterRequest, UserRole } from '../../shared/models/user.model';

@Injectable({ providedIn: 'root' })
export class AuthService {
  private readonly http = inject(HttpClient);
  private readonly router = inject(Router);
  private readonly base = environment.apiBase;

  private readonly _user = signal<AuthUser | null>(null);
  readonly user = this._user.asReadonly();
  readonly isLoggedIn = computed(() => this._user() !== null);
  readonly isAdmin = computed(() => this._user()?.role === UserRole.Admin);
  readonly accessToken = computed(() => this._user()?.accessToken ?? null);

  login(req: LoginRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/login`, req, { withCredentials: true }).pipe(
      tap(r => this._user.set(this.toAuthUser(r)))
    );
  }

  register(req: RegisterRequest): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/register`, req, { withCredentials: true }).pipe(
      tap(r => this._user.set(this.toAuthUser(r)))
    );
  }

  refresh(): Observable<AuthResponse> {
    return this.http.post<AuthResponse>(`${this.base}/auth/refresh`, {}, { withCredentials: true }).pipe(
      tap(r => this._user.set(this.toAuthUser(r)))
    );
  }

  /** Called once at app startup — silently restores session from the refresh cookie.
   *  Always resolves (never rejects) so APP_INITIALIZER doesn't block the app. */
  tryRestore(): Promise<void> {
    return new Promise(resolve => {
      this.refresh().subscribe({ next: () => resolve(), error: () => resolve() });
    });
  }

  logout(): void {
    this.http.post(`${this.base}/auth/logout`, {}, { withCredentials: true }).subscribe({
      complete: () => this.clearAndRedirect(),
      error: () => this.clearAndRedirect(),
    });
  }

  private clearAndRedirect(): void {
    this._user.set(null);
    this.router.navigate(['/login']);
  }

  private toAuthUser(r: AuthResponse): AuthUser {
    return { userId: r.userId, username: r.username, email: r.email, role: r.role, accessToken: r.accessToken };
  }
}
