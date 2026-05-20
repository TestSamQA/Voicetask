import { Component, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { AuthService } from '../../core/auth/auth.service';
import { BtnComponent } from '../../shared/components/btn/btn.component';

@Component({
  selector: 'app-login',
  standalone: true,
  imports: [FormsModule, RouterLink, BtnComponent],
  template: `
    <div class="auth-page">
      <div class="auth-card">
        <div class="brand" style="margin-bottom: 28px; justify-content: center;">
          <div class="brand-mark"></div>
          <div class="brand-name">VoiceTask</div>
        </div>
        <h2 style="font-size: 18px; font-weight: 600; margin-bottom: 4px;">Sign in</h2>
        <p class="muted" style="font-size: 13px; margin-bottom: 24px;">Welcome back</p>

        @if (error()) {
          <div class="auth-error">{{ error() }}</div>
        }

        <form (ngSubmit)="submit()">
          <div class="field" style="margin-bottom: 12px;">
            <div class="field-label">Email</div>
            <input class="field-input" type="email" [(ngModel)]="email" name="email" placeholder="you@example.com" autocomplete="email" required />
          </div>
          <div class="field" style="margin-bottom: 20px;">
            <div class="field-label">Password</div>
            <input class="field-input" type="password" [(ngModel)]="password" name="password" placeholder="••••••••" autocomplete="current-password" required />
          </div>
          <app-btn variant="primary" type="submit" [disabled]="loading()" style="width: 100%;">
            {{ loading() ? 'Signing in…' : 'Sign in' }}
          </app-btn>
        </form>

        <p class="muted" style="font-size: 12.5px; margin-top: 20px; text-align: center;">
          No account? <a routerLink="/register" style="color: var(--accent);">Register</a>
        </p>
      </div>
    </div>
  `,
  styles: [`
    .auth-page { display: flex; align-items: center; justify-content: center; min-height: 100vh; background: var(--bg); padding: 24px; }
    .auth-card { width: 100%; max-width: 380px; background: var(--surface); border: 1px solid var(--border); border-radius: var(--radius-lg); padding: 32px; }
    .auth-error { background: oklch(35% 0.12 25 / .15); border: 1px solid oklch(55% 0.15 25 / .4); color: var(--critical); border-radius: var(--radius); padding: 10px 12px; font-size: 13px; margin-bottom: 16px; }
    app-btn { display: block; }
    app-btn button { width: 100%; justify-content: center; }
  `],
})
export class LoginComponent {
  private readonly auth = inject(AuthService);
  private readonly router = inject(Router);

  email = '';
  password = '';
  loading = signal(false);
  error = signal('');

  submit(): void {
    if (!this.email || !this.password) return;
    this.loading.set(true);
    this.error.set('');
    this.auth.login({ usernameOrEmail: this.email, password: this.password }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: (e) => {
        this.loading.set(false);
        this.error.set(e?.error?.detail || e?.error?.title || 'Invalid credentials');
      },
    });
  }
}
