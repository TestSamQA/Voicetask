import { Component, OnInit, inject, signal } from '@angular/core';
import { ActivatedRoute, Router } from '@angular/router';
import { FormsModule } from '@angular/forms';
import { TaskApiService } from '../../core/api/task-api.service';
import { LabelApiService } from '../../core/api/label-api.service';
import { TaskDetailResponse, TaskStatus, Priority } from '../../shared/models/task.model';
import { Label } from '../../shared/models/label.model';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BtnComponent } from '../../shared/components/btn/btn.component';
import { StatusChipComponent } from '../../shared/components/status-chip/status-chip.component';
import { PrioBarsComponent } from '../../shared/components/prio-bars/prio-bars.component';
import { DueDateComponent } from '../../shared/components/due-date/due-date.component';
import { LabelPillComponent } from '../../shared/components/label-pill/label-pill.component';

@Component({
  selector: 'app-task-detail',
  standalone: true,
  imports: [
    FormsModule, AvatarComponent, IconComponent, BtnComponent,
    StatusChipComponent, PrioBarsComponent, DueDateComponent,
    LabelPillComponent,
  ],
  template: `
    <div class="main">
      <header class="topbar">
        <div class="hstack" style="gap: 12px;">
          <app-btn icon="chevronL" variant="ghost" (click)="router.navigate(['/dashboard'])">Back</app-btn>
          <span style="width:1px;height:18px;background:var(--border)"></span>
          @if (task()) {
            <div class="topbar-meta">TASK · {{ task()!.id.slice(0, 8).toUpperCase() }}</div>
          }
        </div>
        <div class="topbar-actions">
          <app-btn icon="more" variant="ghost" />
        </div>
      </header>

      @if (!task()) {
        <div class="scroll"><div class="page"><div class="empty">Loading…</div></div></div>
      } @else {
        <div class="scroll">
          <div class="detail-page">
            <div class="detail-main">
              <div>
                <div class="detail-breadcrumb">
                  <a style="cursor:pointer;color:var(--fg-muted)" (click)="router.navigate(['/dashboard'])">Dashboard</a>
                  <app-icon name="chevronR" [size]="9" />
                  <span style="color:var(--fg-muted)">{{ task()!.status === TaskStatus.Done ? 'Done' : 'Open' }}</span>
                  <app-icon name="chevronR" [size]="9" />
                  <span style="color:var(--fg-dim)">Edit task</span>
                </div>

                <input class="detail-title-input" [(ngModel)]="task()!.title" (blur)="patchField('title', task()!.title)" />

                <div class="hstack" style="margin-top:12px;gap:8px;flex-wrap:wrap;">
                  <app-status-chip [status]="task()!.status" />
                  <app-prio-bars [level]="task()!.priority" />
                  <app-due-date [value]="task()!.dueDate" />
                  <span class="mono faint" style="font-size:10.5px;letter-spacing:.04em;">
                    · CREATED BY {{ task()!.createdByUsername.toUpperCase() }}
                  </span>
                </div>
              </div>

              <div>
                <div class="section-label">Description</div>
                <textarea class="detail-description"
                          [(ngModel)]="task()!.description"
                          placeholder="Add a description…"
                          (blur)="patchField('description', task()!.description)"></textarea>
              </div>

              <div>
                <div class="section-label">
                  Subtasks
                  @if (task()!.subTasks.length > 0) {
                    <span style="margin-left:auto;display:inline-flex;align-items:center;gap:8px;">
                      <span class="mono faint" style="font-size:10px;">{{ doneSubtasks }}/{{ task()!.subTasks.length }}</span>
                      <span style="width:80px;height:3px;border-radius:2px;background:var(--border);overflow:hidden;">
                        <span [style.width.%]="subtaskProgress * 100" style="display:block;height:100%;background:var(--accent);transition:width 240ms"></span>
                      </span>
                    </span>
                  }
                </div>

                @if (task()!.subTasks.length > 0) {
                  <div class="subtasks">
                    @for (s of task()!.subTasks; track s.id) {
                      <div class="subtask" [class.done]="s.status === TaskStatus.Done">
                        <button class="checkbox" [class.checked]="s.status === TaskStatus.Done"
                                (click)="toggleSubtask(s.id)">
                          @if (s.status === TaskStatus.Done) { <span style="font-size:9px">✓</span> }
                        </button>
                        <span class="subtask-name">{{ s.title }}</span>
                      </div>
                    }
                  </div>
                }

                <div class="subtask-add">
                  <app-icon name="plus" [size]="13" style="color:var(--fg-faint)" />
                  <input [(ngModel)]="newSubtask" placeholder="Add subtask… press Enter"
                         (keydown.enter)="addSubtask()" />
                </div>
              </div>
            </div>

            <aside class="detail-aside">
              <div class="aside-row">
                <div class="aside-row-label">Status</div>
                <select class="select" style="background:transparent;border:0;padding:4px 22px 4px 0;color:var(--fg);margin-left:-6px;font-size:13px;"
                        [value]="task()!.status" (change)="patchField('status', +($any($event.target).value))">
                  <option [value]="TaskStatus.ToDo">To do</option>
                  <option [value]="TaskStatus.InProgress">In progress</option>
                  <option [value]="TaskStatus.Done">Done</option>
                  <option [value]="TaskStatus.Cancelled">Cancelled</option>
                </select>
              </div>
              <div class="aside-row">
                <div class="aside-row-label">Priority</div>
                <select class="select" style="background:transparent;border:0;padding:4px 22px 4px 0;color:var(--fg);margin-left:-6px;"
                        [value]="task()!.priority" (change)="patchField('priority', +($any($event.target).value))">
                  <option [value]="Priority.Low">Low</option>
                  <option [value]="Priority.Medium">Medium</option>
                  <option [value]="Priority.High">High</option>
                  <option [value]="Priority.Critical">Critical</option>
                </select>
              </div>
              <div class="aside-row">
                <div class="aside-row-label">Due date</div>
                <input type="date" [value]="task()!.dueDate || ''"
                       (change)="patchField('dueDate', $any($event.target).value || undefined)"
                       style="background:transparent;border:0;color:var(--fg);font-size:13px;padding:0;" />
              </div>
              <div class="aside-row">
                <div class="aside-row-label">Assignee</div>
                <div class="aside-row-value">
                  <app-avatar [name]="task()!.assigneeUsername || ''" size="sm" />
                  <span>{{ task()!.assigneeUsername || 'Unassigned' }}</span>
                </div>
              </div>
              <div class="aside-row">
                <div class="aside-row-label">Created by</div>
                <div class="aside-row-value">
                  <app-avatar [name]="task()!.createdByUsername" size="sm" />
                  <span>{{ task()!.createdByUsername }}</span>
                </div>
              </div>
              <div class="aside-row">
                <div class="aside-row-label">Labels</div>
                <div class="hstack" style="flex-wrap:wrap;gap:4px;">
                  @for (l of task()!.labels; track l.id) {
                    <app-label-pill [name]="l.name" [colour]="l.colour" />
                  }
                </div>
              </div>

              <div style="border-top: 1px solid var(--border-soft); padding-top: 16px;">
                <app-btn icon="trash" variant="danger" (click)="deleteTask()">Delete task</app-btn>
              </div>
            </aside>
          </div>
        </div>
      }
    </div>
  `,
})
export class TaskDetailComponent implements OnInit {
  readonly router = inject(Router);
  private readonly route = inject(ActivatedRoute);
  private readonly taskApi = inject(TaskApiService);

  task = signal<TaskDetailResponse | null>(null);
  newSubtask = '';
  readonly TaskStatus = TaskStatus;
  readonly Priority = Priority;

  get doneSubtasks(): number { return this.task()?.subTasks.filter(s => s.status === TaskStatus.Done).length ?? 0; }
  get subtaskProgress(): number {
    const t = this.task(); if (!t?.subTasks.length) return 0;
    return this.doneSubtasks / t.subTasks.length;
  }

  ngOnInit(): void {
    const id = this.route.snapshot.paramMap.get('id')!;
    this.taskApi.getTask(id).subscribe(t => this.task.set(t));
  }

  patchField(field: string, value: unknown): void {
    const t = this.task(); if (!t) return;
    this.taskApi.patchTask(t.id, { [field]: value } as any).subscribe(updated => {
      this.task.update(prev => prev ? { ...prev, ...updated } : prev);
    });
  }

  toggleSubtask(subtaskId: string): void {
    const t = this.task(); if (!t) return;
    const sub = t.subTasks.find(s => s.id === subtaskId);
    if (!sub) return;
    const newStatus = sub.status === TaskStatus.Done ? TaskStatus.ToDo : TaskStatus.Done;
    this.taskApi.patchTask(subtaskId, { status: newStatus }).subscribe(updated => {
      this.task.update(prev => prev ? {
        ...prev,
        subTasks: prev.subTasks.map(s => s.id === subtaskId ? { ...s, status: newStatus } : s)
      } : prev);
    });
  }

  addSubtask(): void {
    if (!this.newSubtask.trim()) return;
    const t = this.task(); if (!t) return;
    this.taskApi.createTask({ title: this.newSubtask.trim(), priority: t.priority, status: TaskStatus.ToDo, parentTaskId: t.id }).subscribe(sub => {
      this.task.update(prev => prev ? { ...prev, subTasks: [...prev.subTasks, { ...sub, subTasks: [] }] } : prev);
      this.newSubtask = '';
    });
  }

  deleteTask(): void {
    const t = this.task(); if (!t) return;
    this.taskApi.deleteTask(t.id).subscribe(() => this.router.navigate(['/dashboard']));
  }
}
