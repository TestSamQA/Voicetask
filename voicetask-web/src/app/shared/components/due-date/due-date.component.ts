import { Component, Input } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-due-date',
  standalone: true,
  imports: [IconComponent],
  template: `
    @if (!value) {
      <span class="due faint mono">—</span>
    } @else {
      <span [class]="cls"><app-icon name="calendar" [size]="11" /> {{ label }}</span>
    }
  `,
})
export class DueDateComponent {
  @Input() value?: string;

  get cls(): string {
    const d = this.diff;
    if (d == null) return 'due';
    if (d < 0) return 'due overdue';
    if (d === 0) return 'due today';
    return 'due';
  }

  get label(): string {
    if (!this.value) return '';
    const d = this.diff;
    if (d == null) return this.value;
    if (d < 0) return `${-d}d ago`;
    if (d === 0) return 'Today';
    if (d === 1) return 'Tomorrow';
    if (d < 7) return `${d}d`;
    try {
      return new Date(this.value + 'T00:00:00').toLocaleDateString('en-US', { month: 'short', day: 'numeric' });
    } catch { return this.value; }
  }

  private get diff(): number | null {
    if (!this.value) return null;
    try {
      const now = new Date(); now.setHours(0, 0, 0, 0);
      const dt = new Date(this.value + 'T00:00:00');
      const d = Math.round((dt.getTime() - now.getTime()) / 86400000);
      return isNaN(d) ? null : d;
    } catch { return null; }
  }
}
