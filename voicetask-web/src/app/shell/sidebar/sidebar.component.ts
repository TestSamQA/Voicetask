import { Component, EventEmitter, Input, Output, inject } from '@angular/core';
import { AuthService } from '../../core/auth/auth.service';
import { Label } from '../../shared/models/label.model';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { LabelPillComponent } from '../../shared/components/label-pill/label-pill.component';

export interface SidebarCounts {
  highlight: number;
  assigned: number;
  mine: number;
  all: number;
}

@Component({
  selector: 'app-sidebar',
  standalone: true,
  imports: [AvatarComponent, IconComponent, LabelPillComponent],
  template: `
    <aside class="sidebar">
      <div class="brand">
        <div class="brand-mark"></div>
        <div class="brand-name">VoiceTask</div>
      </div>

      <nav class="nav">
        <button class="nav-item" [class.active]="current === 'dashboard'" (click)="navigate.emit('dashboard')">
          <app-icon name="home" [size]="14" />
          <span>Dashboard</span>
          @if (counts.highlight > 0) { <span class="nav-item-count">{{ counts.highlight }}</span> }
        </button>
        <button class="nav-item" [class.active]="current === 'assigned'" (click)="navigate.emit('assigned')">
          <app-icon name="inbox" [size]="14" />
          <span>Assigned to me</span>
          @if (counts.assigned > 0) { <span class="nav-item-count">{{ counts.assigned }}</span> }
        </button>
        <button class="nav-item" [class.active]="current === 'mine'" (click)="navigate.emit('mine')">
          <app-icon name="list" [size]="14" />
          <span>My tasks</span>
          @if (counts.mine > 0) { <span class="nav-item-count">{{ counts.mine }}</span> }
        </button>
        <button class="nav-item" [class.active]="current === 'all'" (click)="navigate.emit('all')">
          <app-icon name="users" [size]="14" />
          <span>All tasks</span>
          @if (counts.all > 0) { <span class="nav-item-count">{{ counts.all }}</span> }
        </button>

        @if (labels.length > 0) {
          <div class="nav-section-label">Labels</div>
          @for (label of labels.slice(0, 8); track label.id) {
            <button class="nav-item" (click)="navigate.emit('mine')">
              <app-label-pill [name]="label.name" [colour]="label.colour" />
            </button>
          }
        }

        @if (auth.isAdmin()) {
          <div class="nav-section-label">Admin</div>
          <button class="nav-item" [class.active]="current === 'admin-users'" (click)="navigate.emit('admin-users')">
            <app-icon name="users" [size]="14" />
            <span>Users</span>
          </button>
          <button class="nav-item" [class.active]="current === 'admin-labels'" (click)="navigate.emit('admin-labels')">
            <app-icon name="label" [size]="14" />
            <span>Labels</span>
          </button>
        }
      </nav>

      <div class="sidebar-footer">
        <app-avatar [name]="auth.user()?.username || ''" size="sm" />
        <div style="min-width: 0;">
          <div style="font-size: 12.5px; font-weight: 500;">{{ auth.user()?.username }}</div>
          <div class="mono faint" style="font-size: 10px; letter-spacing: .04em;">{{ auth.user()?.email }}</div>
        </div>
        <button class="btn icon ghost" style="margin-left: auto;" (click)="navigate.emit('settings')" title="Sign out" (click)="auth.logout()">
          <app-icon name="settings" [size]="13" style="color: var(--fg-faint)" />
        </button>
      </div>
    </aside>
  `,
})
export class SidebarComponent {
  @Input() current = 'dashboard';
  @Input() counts: SidebarCounts = { highlight: 0, assigned: 0, mine: 0, all: 0 };
  @Input() labels: Label[] = [];
  @Output() navigate = new EventEmitter<string>();

  readonly auth = inject(AuthService);
}
