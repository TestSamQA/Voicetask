import { Component, Input } from '@angular/core';
import { Priority } from '../../models/task.model';

interface PrioConfig { color: string; bars: number; label: string; }
const PRIO: Record<number, PrioConfig> = {
  [Priority.Low]:      { color: 'var(--low)',      bars: 1, label: 'Low' },
  [Priority.Medium]:   { color: 'var(--medium)',   bars: 2, label: 'Medium' },
  [Priority.High]:     { color: 'var(--high)',     bars: 3, label: 'High' },
  [Priority.Critical]: { color: 'var(--critical)', bars: 3, label: 'Critical' },
};

@Component({
  selector: 'app-prio-bars',
  standalone: true,
  template: `
    <span class="prio" [title]="config.label">
      <span class="prio-bars" [style.--prio-c]="config.color">
        <span [class.on]="config.bars >= 1"></span>
        <span [class.on]="config.bars >= 2"></span>
        <span [class.on]="config.bars >= 3"></span>
      </span>
      <span class="prio-text muted">{{ config.label }}</span>
    </span>
  `,
})
export class PrioBarsComponent {
  @Input() level: Priority = Priority.Medium;
  get config(): PrioConfig { return PRIO[this.level] ?? PRIO[Priority.Medium]; }
}
