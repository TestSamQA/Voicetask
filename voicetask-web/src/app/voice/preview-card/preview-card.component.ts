import { Component, EventEmitter, Input, OnInit, Output, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { ConfirmTask } from '../../shared/models/voice.model';
import { Label } from '../../shared/models/label.model';
import { Priority, TaskStatus } from '../../shared/models/task.model';
import { IconComponent } from '../../shared/components/icon/icon.component';

const LABEL_SWATCHES = [
  'oklch(72% 0.14 320)', 'oklch(70% 0.14 250)', 'oklch(72% 0.13 145)',
  'oklch(75% 0.13 65)',  'oklch(70% 0.18 25)',  'oklch(70% 0.12 200)',
  'oklch(70% 0.14 295)', 'oklch(70% 0.10 30)',
];

@Component({
  selector: 'app-preview-card',
  standalone: true,
  imports: [FormsModule, IconComponent],
  template: `
    <div class="preview-card" [class.removed]="removed">
      <div class="preview-card-head">
        <span class="preview-card-index">TASK {{ padded(index) }} / {{ padded(total) }}</span>
        <button class="btn icon ghost" (click)="remove.emit()" title="Remove"><app-icon name="x" [size]="12" /></button>
      </div>

      <input class="field-input title" [(ngModel)]="card.title" placeholder="Task title" (ngModelChange)="onChange()" />
      <textarea class="field-textarea" [(ngModel)]="card.description" placeholder="Description (optional)" (ngModelChange)="onChange()"></textarea>

      <div class="field-row">
        <div class="field">
          <div class="field-label">Priority</div>
          <select class="select" [(ngModel)]="card.priority" (ngModelChange)="onChange()">
            <option [value]="Priority.Low">Low</option>
            <option [value]="Priority.Medium">Medium</option>
            <option [value]="Priority.High">High</option>
            <option [value]="Priority.Critical">Critical</option>
          </select>
        </div>
        <div class="field">
          <div class="field-label">Due</div>
          <input class="field-input" type="date" [(ngModel)]="card.dueDate" (ngModelChange)="onChange()" />
        </div>
      </div>

      <div class="field">
        <div class="field-label">Labels</div>
        <div class="hstack" style="flex-wrap: wrap; gap: 4px;">
          @for (l of labels; track l.id) {
            <button class="chip" [class.on]="isLabelOn(l.id)"
                    (click)="toggleLabel(l.id)">
              <span class="swatch" [style.background]="l.colour" style="display:inline-block;width:6px;height:6px;border-radius:99px;"></span>
              {{ l.name }}
            </button>
          }
          @if (!addingLabel()) {
            <button class="chip new-label-btn" (click)="addingLabel.set(true)">
              <app-icon name="plus" [size]="9" /> new
            </button>
          }
        </div>
        @if (addingLabel()) {
          <div class="new-label-form">
            <input class="field-input" [(ngModel)]="newLabelName" placeholder="label name…" (keydown)="onLabelKey($event)" autofocus />
            <div class="new-label-swatches">
              @for (c of swatches; track c) {
                <button class="swatch-btn" [class.on]="newLabelColor() === c" [style.background]="c" (click)="newLabelColor.set(c)"></button>
              }
            </div>
            <div class="new-label-actions">
              <button class="btn ghost" (click)="addingLabel.set(false); newLabelName = ''">Cancel</button>
              <button class="btn primary" [disabled]="!newLabelName.trim()" (click)="commitLabel()">Add label</button>
            </div>
          </div>
        }
      </div>

      <div class="subtasks-mini">
        <div class="field-label" style="margin-bottom: 4px;">Subtasks · {{ card.subTasks.length }}</div>
        @for (s of card.subTasks; track $index) {
          <div class="subtask-mini">
            <button class="checkbox" style="flex-shrink:0"></button>
            <input style="flex:1;font-size:12.5px;background:transparent;" [(ngModel)]="s.title" placeholder="Subtask…" (ngModelChange)="onChange()" />
            <button class="subtask-mini-x" (click)="removeSubtask($index)"><app-icon name="x" [size]="10" /></button>
          </div>
        }
        <button class="subtask-mini-add" (click)="addSubtask()">
          <app-icon name="plus" [size]="11" /> ADD SUBTASK
        </button>
      </div>
    </div>
  `,
})
export class PreviewCardComponent {
  @Input() card!: ConfirmTask;
  @Input() index = 1;
  @Input() total = 1;
  @Input() labels: Label[] = [];
  @Input() removed = false;
  @Output() change = new EventEmitter<ConfirmTask>();
  @Output() remove = new EventEmitter<void>();
  @Output() addLabel = new EventEmitter<{ name: string; colour: string }>();

  readonly Priority = Priority;
  readonly TaskStatus = TaskStatus;
  addingLabel = signal(false);
  newLabelName = '';
  newLabelColor = signal(LABEL_SWATCHES[0]);
  readonly swatches = LABEL_SWATCHES;

  padded(n: number): string { return String(n).padStart(2, '0'); }

  isLabelOn(id: string): boolean { return (this.card.labelIds ?? []).includes(id); }

  toggleLabel(id: string): void {
    const ids = this.card.labelIds ?? [];
    this.card.labelIds = ids.includes(id) ? ids.filter(x => x !== id) : [...ids, id];
    this.onChange();
  }

  addSubtask(): void {
    this.card.subTasks = [...(this.card.subTasks ?? []), { title: '' }];
    this.onChange();
  }

  removeSubtask(i: number): void {
    this.card.subTasks = this.card.subTasks.filter((_, idx) => idx !== i);
    this.onChange();
  }

  onLabelKey(e: KeyboardEvent): void {
    if (e.key === 'Enter') this.commitLabel();
    if (e.key === 'Escape') { this.addingLabel.set(false); this.newLabelName = ''; }
  }

  commitLabel(): void {
    if (!this.newLabelName.trim()) return;
    this.addLabel.emit({ name: this.newLabelName.trim(), colour: this.newLabelColor() });
    this.newLabelName = '';
    this.addingLabel.set(false);
  }

  // Emit the same reference (not a spread copy) so @for's track doesn't see a new
  // object and destroy/recreate the component — which would dismiss the mobile keyboard.
  onChange(): void { this.change.emit(this.card); }
}
