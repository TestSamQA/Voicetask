import { Component, Input } from '@angular/core';
import { TaskStatus } from '../../models/task.model';

interface StatusConfig { color: string; label: string; ring: boolean; }
const STATUS: Record<number, StatusConfig> = {
  [TaskStatus.ToDo]:       { color: 'var(--status-todo)',      label: 'To do',       ring: true },
  [TaskStatus.InProgress]: { color: 'var(--status-progress)',  label: 'In progress', ring: false },
  [TaskStatus.Done]:       { color: 'var(--status-done)',      label: 'Done',        ring: false },
  [TaskStatus.Cancelled]:  { color: 'var(--status-cancelled)', label: 'Cancelled',   ring: true },
};

@Component({
  selector: 'app-status-chip',
  standalone: true,
  template: `
    <span class="status-chip">
      <span class="status-dot" [class.ring]="config.ring" [style.--sc]="config.color"></span>
      {{ config.label }}
    </span>
  `,
})
export class StatusChipComponent {
  @Input() status: TaskStatus = TaskStatus.ToDo;
  get config(): StatusConfig { return STATUS[this.status] ?? STATUS[TaskStatus.ToDo]; }
}
