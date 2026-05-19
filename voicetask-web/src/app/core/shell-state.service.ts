import { Injectable, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ShellStateService {
  readonly unreadCount = signal(0);
  readonly drawerOpen = signal(false);

  openNotifications(): void { this.drawerOpen.set(true); }
}
