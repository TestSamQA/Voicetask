import { Component, EventEmitter, Input, Output } from '@angular/core';
import { NotificationDto } from '../../shared/models/notification.model';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BtnComponent } from '../../shared/components/btn/btn.component';

@Component({
  selector: 'app-notifications-drawer',
  standalone: true,
  imports: [IconComponent, AvatarComponent, BtnComponent],
  template: `
    <div class="drawer-backdrop" (click)="close.emit()"></div>
    <div class="drawer">
      <div class="drawer-head">
        <div>
          <div class="drawer-title">Notifications</div>
          <div class="mono faint" style="font-size: 10px; letter-spacing: .06em; text-transform: uppercase; margin-top: 2px;">
            {{ unreadCount }} UNREAD
          </div>
        </div>
        <div class="hstack" style="gap: 4px;">
          <app-btn variant="ghost" (click)="markAll.emit()">Mark all read</app-btn>
          <button class="btn icon ghost" (click)="close.emit()"><app-icon name="x" [size]="12" /></button>
        </div>
      </div>

      <div class="drawer-list">
        @for (n of notifications; track n.id) {
          <div class="notif" [class.unread]="!n.isRead" (click)="n.taskId && openTask.emit(n.taskId)">
            <app-avatar [name]="''" size="sm" />
            <div class="notif-body">
              <p class="notif-msg">{{ n.message }}</p>
              <div class="notif-time">{{ formatTime(n.createdAt) }}</div>
            </div>
          </div>
        }
        @if (notifications.length === 0) {
          <div class="empty" style="padding: 32px 0;">— NO NOTIFICATIONS —</div>
        }
      </div>
    </div>
  `,
})
export class NotificationsDrawerComponent {
  @Input() notifications: NotificationDto[] = [];
  @Input() unreadCount = 0;
  @Output() close = new EventEmitter<void>();
  @Output() markAll = new EventEmitter<void>();
  @Output() openTask = new EventEmitter<string>();

  formatTime(iso: string): string {
    try {
      const d = new Date(iso);
      const diff = Math.floor((Date.now() - d.getTime()) / 60000);
      if (diff < 1) return 'JUST NOW';
      if (diff < 60) return `${diff}M AGO`;
      if (diff < 1440) return `${Math.floor(diff / 60)}H AGO`;
      return `${Math.floor(diff / 1440)}D AGO`;
    } catch { return ''; }
  }
}
