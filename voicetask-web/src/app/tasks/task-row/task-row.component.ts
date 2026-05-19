import { Component, EventEmitter, Input, Output } from '@angular/core';
import { TaskResponse, TaskStatus } from '../../shared/models/task.model';
import { Label } from '../../shared/models/label.model';
import { AvatarComponent } from '../../shared/components/avatar/avatar.component';
import { PrioBarsComponent } from '../../shared/components/prio-bars/prio-bars.component';
import { DueDateComponent } from '../../shared/components/due-date/due-date.component';
import { LabelPillComponent } from '../../shared/components/label-pill/label-pill.component';

@Component({
  selector: 'app-task-row',
  standalone: true,
  imports: [AvatarComponent, PrioBarsComponent, DueDateComponent, LabelPillComponent],
  template: `
    <div class="task-row" [class.done]="task.status === TaskStatus.Done" (click)="open.emit(task.id)">
      <div (click)="$event.stopPropagation(); toggle.emit(task.id)">
        <button class="checkbox" [class.checked]="task.status === TaskStatus.Done" [attr.aria-pressed]="task.status === TaskStatus.Done">
          @if (task.status === TaskStatus.Done) { <span style="color:currentColor;font-size:9px;">✓</span> }
        </button>
      </div>

      <div class="task-title">
        <div class="task-title-text">{{ task.title }}</div>
        @if (task.subTaskCount > 0 || task.assigneeUsername) {
          <div class="task-sub">
            @if (task.assigneeUsername && task.assigneeUsername !== task.createdByUsername) {
              <span>From {{ task.createdByUsername }}</span>
            }
            @if (task.subTaskCount > 0) {
              <span class="task-sub-dot"></span>
              <span>{{ task.subTaskCount }} subtasks</span>
            }
          </div>
        }
      </div>

      <div class="hstack" style="gap: 4px;">
        @for (label of task.labels.slice(0, 2); track label.id) {
          <app-label-pill [name]="label.name" [colour]="label.colour" />
        }
      </div>

      <app-prio-bars [level]="task.priority" />
      <app-due-date [value]="task.dueDate" />
      <app-avatar [name]="task.createdByUsername" size="sm" />
    </div>
  `,
})
export class TaskRowComponent {
  @Input() task!: TaskResponse;
  @Input() labels: Label[] = [];
  @Output() open = new EventEmitter<string>();
  @Output() toggle = new EventEmitter<string>();

  readonly TaskStatus = TaskStatus;
}
