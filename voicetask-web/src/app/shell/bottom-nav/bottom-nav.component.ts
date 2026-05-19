import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { SidebarCounts } from '../sidebar/sidebar.component';

@Component({
  selector: 'app-bottom-nav',
  standalone: true,
  imports: [IconComponent],
  template: `
    <nav class="bottom-nav">
      <button class="bottom-nav-item" [class.active]="current === 'dashboard'" (click)="navigate.emit('dashboard')">
        <app-icon name="home" [size]="20" />
        <span>Home</span>
      </button>

      <button class="bottom-nav-item" [class.active]="current === 'assigned'" (click)="navigate.emit('assigned')">
        <app-icon name="inbox" [size]="20" />
        @if (counts.assigned > 0) {
          <span class="bottom-nav-badge">{{ counts.assigned > 9 ? '9+' : counts.assigned }}</span>
        }
        <span>Assigned</span>
      </button>

      <button class="bottom-nav-item" [class.active]="current === 'mine'" (click)="navigate.emit('mine')">
        <app-icon name="list" [size]="20" />
        <span>My tasks</span>
      </button>

      <button class="bottom-nav-item" [class.active]="current === 'all'" (click)="navigate.emit('all')">
        <app-icon name="users" [size]="20" />
        <span>All</span>
      </button>

      <button class="bottom-nav-item" (click)="openNotifications.emit()">
        <app-icon name="bell" [size]="20" />
        @if (unreadCount > 0) {
          <span class="bottom-nav-badge">{{ unreadCount > 9 ? '9+' : unreadCount }}</span>
        }
        <span>Alerts</span>
      </button>
    </nav>
  `,
})
export class BottomNavComponent {
  @Input() current = 'dashboard';
  @Input() counts: SidebarCounts = { highlight: 0, assigned: 0, mine: 0, all: 0 };
  @Input() unreadCount = 0;
  @Output() navigate = new EventEmitter<string>();
  @Output() openNotifications = new EventEmitter<void>();
}
