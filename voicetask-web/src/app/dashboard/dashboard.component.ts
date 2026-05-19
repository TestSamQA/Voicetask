import { Component, OnDestroy, OnInit, computed, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ActivatedRoute, Router } from '@angular/router';
import { TaskApiService } from '../core/api/task-api.service';
import { AuthService } from '../core/auth/auth.service';
import { ShellStateService } from '../core/shell-state.service';
import { TaskResponse, TaskStatus } from '../shared/models/task.model';
import { TaskRowComponent } from '../tasks/task-row/task-row.component';
import { AvatarComponent } from '../shared/components/avatar/avatar.component';
import { IconComponent } from '../shared/components/icon/icon.component';
import { BtnComponent } from '../shared/components/btn/btn.component';
import { PrioBarsComponent } from '../shared/components/prio-bars/prio-bars.component';
import { DueDateComponent } from '../shared/components/due-date/due-date.component';
import { BellButtonComponent } from '../notifications/bell-button/bell-button.component';
import { RecordOverlayComponent } from '../voice/record-overlay/record-overlay.component';

@Component({
  selector: 'app-dashboard',
  standalone: true,
  imports: [
    FormsModule, TaskRowComponent, AvatarComponent, IconComponent,
    BtnComponent, PrioBarsComponent, DueDateComponent, BellButtonComponent,
    RecordOverlayComponent,
  ],
  template: `
    <div class="main">
      <header class="topbar">
        <div>
          <div class="topbar-title">Dashboard</div>
          <div class="topbar-meta">{{ dateStr.toUpperCase() }}</div>
        </div>
        <div class="topbar-actions">
          <app-bell-button [count]="shellState.unreadCount()" (clicked)="shellState.openNotifications()" />
        </div>
      </header>

      <div class="scroll">
        <div class="page">
          <div class="page-header">
            <div>
              <h1 class="page-title">Good {{ greeting }}, {{ auth.user()?.username }}</h1>
              <div class="page-subtitle">
                {{ openTasks().length }} OPEN · {{ unacknowledged().length }} NEW · {{ doneTasks().length }} DONE
              </div>
            </div>
          </div>

          @if (unacknowledged().length > 0) {
            <section class="highlight-strip">
              <div class="highlight-head">
                <div class="section-label" style="margin: 0;">
                  <span class="section-label-dot"></span>
                  Newly assigned to you
                </div>
                <span class="mono faint" style="font-size: 10px; letter-spacing: .04em;">
                  {{ unacknowledged().length }} {{ unacknowledged().length === 1 ? 'TASK' : 'TASKS' }} · TAP TO CLEAR
                </span>
              </div>
              <div class="highlight-cards">
                @for (t of unacknowledged(); track t.id) {
                  <div class="highlight-card" (click)="openTask(t.id)">
                    <app-avatar [name]="t.createdByUsername" />
                    <div class="highlight-card-body">
                      <div class="highlight-card-meta">ASSIGNED BY <b>{{ t.createdByUsername }}</b></div>
                      <div class="highlight-card-title">{{ t.title }}</div>
                    </div>
                    <div class="hstack" style="gap: 6px;">
                      <app-prio-bars [level]="t.priority" />
                      <app-due-date [value]="t.dueDate" />
                    </div>
                    <app-btn variant="ghost" (click)="$event.stopPropagation(); acknowledge(t.id)">Got it</app-btn>
                  </div>
                }
              </div>
            </section>
          }

          <section>
            <div class="filter-bar">
              <input class="search-input" placeholder="Search tasks…" [(ngModel)]="searchTerm" />
              <button class="chip" [class.on]="filter() === 'all'" (click)="filter.set('all')">All</button>
              <button class="chip" [class.on]="filter() === 'today'" (click)="filter.set('today')">Today</button>
              <button class="chip" [class.on]="filter() === 'week'" (click)="filter.set('week')">Week</button>
              <button class="chip" [class.on]="filter() === 'high'" (click)="filter.set('high')">High+</button>
            </div>

            <div class="section-label">{{ viewLabel }} · {{ filteredTasks().length }}</div>
            <div class="task-list">
              @if (filteredTasks().length === 0) {
                <div class="empty">— NOTHING HERE —</div>
              } @else {
                @for (t of filteredTasks(); track t.id) {
                  <app-task-row [task]="t" (open)="openTask($event)" (toggle)="toggleDone($event)" />
                }
              }
            </div>

            @if (doneTasks().length > 0) {
              <div style="margin-top: 36px;">
                <div class="section-label">Done · {{ doneTasks().length }}</div>
                <div class="task-list">
                  @for (t of doneTasks(); track t.id) {
                    <app-task-row [task]="t" (open)="openTask($event)" (toggle)="toggleDone($event)" />
                  }
                </div>
              </div>
            }
          </section>
        </div>
      </div>

      <div class="voice-fab-wrap">
        <span class="voice-fab-hint">
          <app-icon name="mic" [size]="11" />
          New task · <span class="kbd">Space</span>
        </span>
        <button class="voice-fab" (click)="recording.set(true)" aria-label="Record a new task">
          <span class="voice-fab-pulse"></span>
          <span class="voice-fab-pulse delay"></span>
          <app-icon name="mic" [size]="28" />
        </button>
      </div>
    </div>

    @if (recording()) {
      <app-record-overlay (cancel)="recording.set(false)" (stopped)="onRecordingStopped($event)" />
    }
  `,
})
export class DashboardComponent implements OnInit, OnDestroy {
  private readonly taskApi = inject(TaskApiService);
  private readonly route = inject(ActivatedRoute);
  readonly auth = inject(AuthService);
  readonly shellState = inject(ShellStateService);
  private readonly router = inject(Router);

  tasks = signal<TaskResponse[]>([]);
  unacknowledged = signal<TaskResponse[]>([]);
  filter = signal<'all' | 'today' | 'week' | 'high'>('all');
  recording = signal(false);
  searchTerm = '';

  readonly dateStr = new Date().toLocaleDateString('en-US', { weekday: 'long', month: 'long', day: 'numeric' });

  get greeting(): string {
    const h = new Date().getHours();
    if (h < 12) return 'morning';
    if (h < 17) return 'afternoon';
    return 'evening';
  }

  get viewLabel(): string {
    const v = this.route.snapshot.queryParamMap.get('view');
    if (v === 'assigned') return 'Assigned to me';
    if (v === 'mine') return 'My tasks';
    if (v === 'all') return 'All tasks';
    return 'My open tasks';
  }

  readonly TaskStatus = TaskStatus;
  openTasks = computed(() => this.tasks().filter(t => t.status !== TaskStatus.Done && t.status !== TaskStatus.Cancelled));
  doneTasks = computed(() => this.tasks().filter(t => t.status === TaskStatus.Done));

  filteredTasks = computed(() => {
    const open = this.openTasks();
    const today = new Date(); today.setHours(0, 0, 0, 0);
    const isoToday = today.toISOString().slice(0, 10);
    const msWeek = 7 * 86400000;

    let result = open;
    if (this.filter() === 'today') result = open.filter(t => t.dueDate === isoToday);
    else if (this.filter() === 'week') result = open.filter(t => {
      if (!t.dueDate) return false;
      return new Date(t.dueDate).getTime() - today.getTime() <= msWeek;
    });
    else if (this.filter() === 'high') result = open.filter(t => t.priority >= 2);

    const s = this.searchTerm.trim().toLowerCase();
    if (s) result = result.filter(t => t.title.toLowerCase().includes(s));
    return result;
  });

  ngOnInit(): void {
    this.loadTasks();
    this.loadUnacknowledged();
    document.addEventListener('keydown', this.onKey);
  }

  ngOnDestroy(): void {
    document.removeEventListener('keydown', this.onKey);
  }

  private onKey = (e: KeyboardEvent) => {
    if (e.code === 'Space' && !this.recording()) {
      const tag = (document.activeElement as HTMLElement)?.tagName;
      if (tag !== 'INPUT' && tag !== 'TEXTAREA' && tag !== 'SELECT') {
        e.preventDefault();
        this.recording.set(true);
      }
    }
  };

  private loadTasks(): void {
    this.taskApi.getTasks({ pageSize: 100 }).subscribe(r => this.tasks.set(r.items));
  }

  private loadUnacknowledged(): void {
    this.taskApi.getUnacknowledged().subscribe(ts => this.unacknowledged.set(ts));
  }

  openTask(id: string): void { this.router.navigate(['/tasks', id]); }

  acknowledge(id: string): void {
    this.taskApi.acknowledgeTask(id).subscribe(() => {
      this.unacknowledged.update(ts => ts.filter(t => t.id !== id));
    });
  }

  toggleDone(id: string): void {
    const task = this.tasks().find(t => t.id === id);
    if (!task) return;
    const newStatus = task.status === TaskStatus.Done ? TaskStatus.ToDo : TaskStatus.Done;
    this.taskApi.patchTask(id, { status: newStatus }).subscribe(updated => {
      this.tasks.update(ts => ts.map(t => t.id === id ? updated : t));
    });
  }

  onRecordingStopped(transcript: string): void {
    this.recording.set(false);
    this.router.navigate(['/voice/preview'], { state: { transcript } });
  }
}
