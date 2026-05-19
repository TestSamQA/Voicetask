import { Component, OnInit, inject, signal } from '@angular/core';
import { AdminApiService } from '../../core/api/admin-api.service';
import { UserSummary, UserRole } from '../../shared/models/user.model';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { BtnComponent } from '../../shared/components/btn/btn.component';

@Component({
  selector: 'app-admin-users',
  standalone: true,
  imports: [AvatarComponent, BtnComponent],
  template: `
    <div class="main">
      <header class="topbar">
        <div>
          <div class="topbar-title">Users</div>
          <div class="topbar-meta">ADMIN</div>
        </div>
      </header>
      <div class="scroll">
        <div class="page">
          <div class="section-label">{{ users().length }} users</div>
          <div class="task-list">
            @for (u of users(); track u.id) {
              <div class="task-row">
                <app-avatar [name]="u.username" size="sm" />
                <div class="task-title">
                  <div class="task-title-text">{{ u.username }}</div>
                  <div class="task-sub">{{ u.email }}</div>
                </div>
                <span class="status-chip">
                  <span class="status-dot" [class.ring]="u.role === UserRole.Member"
                        [style.--sc]="u.role === UserRole.Admin ? 'var(--accent)' : 'var(--status-todo)'"></span>
                  {{ u.role === UserRole.Admin ? 'Admin' : 'Member' }}
                </span>
                <div class="hstack" style="gap: 4px; margin-left: auto;">
                  @if (u.role === UserRole.Member) {
                    <app-btn variant="ghost" size="sm" (click)="promote(u)">Make admin</app-btn>
                  } @else {
                    <app-btn variant="ghost" size="sm" (click)="demote(u)">Remove admin</app-btn>
                  }
                </div>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class AdminUsersComponent implements OnInit {
  private readonly adminApi = inject(AdminApiService);
  users = signal<UserSummary[]>([]);
  readonly UserRole = UserRole;

  ngOnInit(): void {
    this.adminApi.getUsers().subscribe(us => this.users.set(us));
  }

  promote(u: UserSummary): void {
    this.adminApi.updateUser(u.id, UserRole.Admin).subscribe(updated => {
      this.users.update(us => us.map(x => x.id === u.id ? updated : x));
    });
  }

  demote(u: UserSummary): void {
    this.adminApi.updateUser(u.id, UserRole.Member).subscribe(updated => {
      this.users.update(us => us.map(x => x.id === u.id ? updated : x));
    });
  }
}
