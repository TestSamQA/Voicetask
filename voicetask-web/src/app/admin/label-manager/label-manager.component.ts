import { Component, OnInit, inject, signal } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { LabelApiService } from '../../core/api/label-api.service';
import { Label } from '../../shared/models/label.model';
import { LabelPillComponent } from '../../shared/components/label-pill/label-pill.component';
import { BtnComponent } from '../../shared/components/btn/btn.component';
import { IconComponent } from '../../shared/components/icon/icon.component';

const SWATCHES = [
  'oklch(72% 0.14 320)', 'oklch(70% 0.14 250)', 'oklch(72% 0.13 145)',
  'oklch(75% 0.13 65)',  'oklch(70% 0.18 25)',  'oklch(70% 0.12 200)',
];

@Component({
  selector: 'app-label-manager',
  standalone: true,
  imports: [FormsModule, LabelPillComponent, BtnComponent, IconComponent],
  template: `
    <div class="main">
      <header class="topbar">
        <div>
          <div class="topbar-title">Labels</div>
          <div class="topbar-meta">ADMIN</div>
        </div>
      </header>
      <div class="scroll">
        <div class="page">
          <div class="section-label">Create label</div>
          <div class="hstack" style="gap: 8px; margin-bottom: 24px; flex-wrap: wrap;">
            <input class="field-input" [(ngModel)]="newName" placeholder="label-name" style="max-width: 200px;" />
            <div class="hstack" style="gap: 4px;">
              @for (c of swatches; track c) {
                <button class="swatch-btn" [class.on]="newColour === c" [style.background]="c" (click)="newColour = c"></button>
              }
            </div>
            <app-btn variant="primary" [disabled]="!newName.trim()" (click)="create()">Create</app-btn>
          </div>

          <div class="section-label">{{ labels().length }} labels</div>
          <div class="task-list">
            @for (l of labels(); track l.id) {
              <div class="task-row">
                <app-label-pill [name]="l.name" [colour]="l.colour" />
                <div class="task-title"><div class="task-title-text">{{ l.name }}</div></div>
                <button class="btn icon ghost" style="margin-left:auto;" (click)="delete(l)">
                  <app-icon name="trash" [size]="12" />
                </button>
              </div>
            }
          </div>
        </div>
      </div>
    </div>
  `,
})
export class LabelManagerComponent implements OnInit {
  private readonly labelApi = inject(LabelApiService);
  labels = signal<Label[]>([]);
  newName = '';
  newColour = SWATCHES[0];
  readonly swatches = SWATCHES;

  ngOnInit(): void {
    this.labelApi.getLabels().subscribe(ls => this.labels.set(ls));
  }

  create(): void {
    if (!this.newName.trim()) return;
    this.labelApi.createLabel({ name: this.newName.trim(), colour: this.newColour }).subscribe(l => {
      this.labels.update(ls => [...ls, l]);
      this.newName = '';
    });
  }

  delete(l: Label): void {
    this.labelApi.deleteLabel(l.id).subscribe(() => {
      this.labels.update(ls => ls.filter(x => x.id !== l.id));
    });
  }
}
