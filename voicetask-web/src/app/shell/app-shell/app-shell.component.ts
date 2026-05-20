import { Component, OnInit, OnDestroy, inject, signal, computed, effect } from '@angular/core';
import { RouterOutlet, Router } from '@angular/router';
import { SidebarComponent, SidebarCounts } from '../sidebar/sidebar.component';
import { NotificationsDrawerComponent } from '../../notifications/notifications-drawer/notifications-drawer.component';
import { BottomNavComponent } from '../bottom-nav/bottom-nav.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { LabelApiService } from '../../core/api/label-api.service';
import { NotificationApiService } from '../../core/api/notification-api.service';
import { NotificationHubService } from '../../core/signalr/notification-hub.service';
import { AuthService } from '../../core/auth/auth.service';
import { ThemeService } from '../../core/theme.service';
import { ShellStateService } from '../../core/shell-state.service';
import { Label } from '../../shared/models/label.model';
import { NotificationDto } from '../../shared/models/notification.model';

@Component({
  selector: 'app-shell',
  standalone: true,
  imports: [RouterOutlet, SidebarComponent, NotificationsDrawerComponent, BottomNavComponent, IconComponent],
  template: `
    <!-- Persistent top app-bar — fixed, full width, always visible -->
    <header class="app-bar">
      <div class="app-bar-brand">
        <div class="brand-mark"></div>
        <span class="brand-name">VoiceTask</span>
      </div>
      <div class="spacer"></div>
      <span class="app-bar-user">{{ auth.user()?.username }}</span>
      <button class="btn icon ghost app-bar-theme-btn"
              (click)="theme.toggle()"
              [attr.title]="theme.isDark() ? 'Switch to light mode' : 'Switch to dark mode'">
        <app-icon [name]="theme.isDark() ? 'sun' : 'moon'" [size]="15" />
      </button>
    </header>

    <div class="app">
      <app-sidebar
        [current]="currentNav()"
        [counts]="sidebarCounts()"
        [labels]="labels()"
        (navigate)="onNavigate($event)" />

      <router-outlet />

      @if (drawerOpen()) {
        <app-notifications-drawer
          [notifications]="notifications()"
          [unreadCount]="unreadCount()"
          (close)="closeDrawer()"
          (markAll)="markAllRead()"
          (openTask)="openTask($event)" />
      }
    </div>

    <app-bottom-nav
      [current]="currentNav()"
      [counts]="sidebarCounts()"
      [unreadCount]="unreadCount()"
      (navigate)="onNavigate($event)"
      (openNotifications)="shellState.openNotifications()" />
  `,
})
export class AppShellComponent implements OnInit, OnDestroy {
  private readonly router = inject(Router);
  readonly auth = inject(AuthService);
  readonly theme = inject(ThemeService);
  private readonly labelApi = inject(LabelApiService);
  private readonly notifApi = inject(NotificationApiService);
  private readonly hub = inject(NotificationHubService);
  readonly shellState = inject(ShellStateService);

  labels = signal<Label[]>([]);
  notifications = signal<NotificationDto[]>([]);
  currentNav = signal('dashboard');

  drawerOpen = this.shellState.drawerOpen;
  unreadCount = computed(() => this.notifications().filter(n => !n.isRead).length);
  sidebarCounts = computed<SidebarCounts>(() => ({
    highlight: 0,
    assigned: 0,
    mine: 0,
    all: 0,
  }));

  constructor() {
    effect(() => {
      this.shellState.unreadCount.set(this.unreadCount());
    });
  }

  ngOnInit(): void {
    this.labelApi.getLabels().subscribe(ls => this.labels.set(ls));
    this.notifApi.getNotifications().subscribe(r => this.notifications.set(r.items));

    const token = this.auth.accessToken();
    if (token) {
      this.hub.connect(token).catch(() => {});
      this.hub.notification$.subscribe(n => {
        this.notifications.update(ns => [n, ...ns]);
      });
    }

    this.router.events.subscribe(() => {
      const url = this.router.url;
      if (url.includes('/admin/users')) this.currentNav.set('admin-users');
      else if (url.includes('/admin/labels')) this.currentNav.set('admin-labels');
      else if (url.includes('/tasks/') || url.includes('/voice')) this.currentNav.set('dashboard');
      else this.currentNav.set('dashboard');
    });
  }

  ngOnDestroy(): void {
    this.hub.disconnect();
  }

  closeDrawer(): void { this.shellState.drawerOpen.set(false); }

  onNavigate(id: string): void {
    if (id === 'dashboard' || id === 'assigned' || id === 'mine' || id === 'all') {
      this.router.navigate(['/dashboard'], { queryParams: id !== 'dashboard' ? { view: id } : {} });
    } else if (id === 'admin-users') {
      this.router.navigate(['/admin/users']);
    } else if (id === 'admin-labels') {
      this.router.navigate(['/admin/labels']);
    }
    this.currentNav.set(id);
  }

  markAllRead(): void {
    this.notifApi.markAllRead().subscribe(() => {
      this.notifications.update(ns => ns.map(n => ({ ...n, isRead: true })));
    });
  }

  openTask(taskId: string): void {
    this.shellState.drawerOpen.set(false);
    this.router.navigate(['/tasks', taskId]);
  }
}
