import { APP_INITIALIZER, ApplicationConfig, provideBrowserGlobalErrorListeners } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideHttpClient, withInterceptors } from '@angular/common/http';
import { routes } from './app.routes';
import { authInterceptor } from './core/auth/auth.interceptor';
import { AuthService } from './core/auth/auth.service';

export const appConfig: ApplicationConfig = {
  providers: [
    provideBrowserGlobalErrorListeners(),
    provideRouter(routes),
    provideHttpClient(withInterceptors([authInterceptor])),
    // Restore session from the HTTP-only refresh cookie before the router runs.
    // If the cookie is still valid the user skips the login page entirely.
    // If it has expired (or never existed) this resolves silently and the
    // authGuard redirects to /login as normal.
    {
      provide: APP_INITIALIZER,
      useFactory: (auth: AuthService) => () => auth.tryRestore(),
      deps: [AuthService],
      multi: true,
    },
  ],
};
