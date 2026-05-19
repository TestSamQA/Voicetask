import { Component, OnInit, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { VoiceApiService } from '../../core/api/voice-api.service';
import { LabelApiService } from '../../core/api/label-api.service';
import { VoiceCaptureResponse, ConfirmTask } from '../../shared/models/voice.model';
import { Label } from '../../shared/models/label.model';
import { Priority, TaskStatus } from '../../shared/models/task.model';
import { PreviewCardComponent } from '../preview-card/preview-card.component';
import { IconComponent } from '../../shared/components/icon/icon.component';
import { BtnComponent } from '../../shared/components/btn/btn.component';
import { ProcessingOverlayComponent } from '../processing-overlay/processing-overlay.component';

@Component({
  selector: 'app-voice-preview',
  standalone: true,
  imports: [PreviewCardComponent, IconComponent, BtnComponent, ProcessingOverlayComponent],
  template: `
    @if (processing()) {
      <app-processing-overlay />
    } @else {
      <div class="main">
        <header class="topbar">
          <div class="hstack">
            <app-btn icon="chevronL" variant="ghost" (click)="router.navigate(['/dashboard'])">Back</app-btn>
            <span style="width:1px;height:18px;background:var(--border)"></span>
            <div>
              <div class="topbar-title">Review captured tasks</div>
              <div class="topbar-meta">
                <app-icon name="sparkle" [size]="10" style="color:var(--accent);vertical-align:-1px" />
                CLAUDE FOUND {{ activeTasks().length }} {{ activeTasks().length === 1 ? 'TASK' : 'TASKS' }}
              </div>
            </div>
          </div>
        </header>

        <div class="preview-shell">
          <div class="preview-header">
            <div>
              <h2 class="preview-h1">Edit anything before saving</h2>
              <div class="page-subtitle" style="font-size: 12px;">
                Each card becomes a parent task. Subtasks stay attached. Confirm all when you're happy.
              </div>
            </div>
          </div>

          @if (captureResponse()?.transcript) {
            <div class="preview-transcript">
              <span class="mono faint" style="font-size:10px;letter-spacing:.08em;text-transform:uppercase;display:block;margin-bottom:6px;">Transcript</span>
              "{{ captureResponse()!.transcript }}"
            </div>
          }

          <div class="preview-cards-scroll">
            <div class="preview-cards-row">
              @for (card of cards(); track card; let i = $index) {
                <app-preview-card
                  [card]="card"
                  [index]="i + 1"
                  [total]="activeTasks().length"
                  [labels]="labels()"
                  (change)="updateCard(i, $event)"
                  (remove)="removeCard(i)"
                  (addLabel)="onAddLabel($event)" />
              }

              <button class="preview-card" style="border:1px dashed var(--border);background:transparent;align-items:center;justify-content:center;color:var(--fg-faint);min-height:280px;"
                      (click)="addCard()">
                <app-icon name="plus" [size]="16" />
                <span class="mono" style="font-size:11px;letter-spacing:.08em;margin-top:8px;">ADD ANOTHER</span>
              </button>
            </div>
          </div>

          <div class="preview-footer">
            <app-btn icon="trash" variant="ghost" (click)="router.navigate(['/dashboard'])">Discard all</app-btn>
            <div class="hstack">
              <span class="mono faint" style="font-size:11px;">{{ activeTasks().length }} READY TO SAVE</span>
              <app-btn icon="check" variant="primary" size="lg" [disabled]="saving()" (click)="confirm()">
                {{ saving() ? 'Saving…' : 'Confirm all' }}
              </app-btn>
            </div>
          </div>
        </div>
      </div>
    }
  `,
})
export class VoicePreviewComponent implements OnInit {
  readonly router = inject(Router);
  private readonly voiceApi = inject(VoiceApiService);
  private readonly labelApi = inject(LabelApiService);

  captureResponse = signal<VoiceCaptureResponse | null>(null);
  cards = signal<ConfirmTask[]>([]);
  labels = signal<Label[]>([]);
  processing = signal(true);
  saving = signal(false);

  activeTasks = signal<ConfirmTask[]>([]);

  ngOnInit(): void {
    const state = history.state as { transcript?: string };
    this.labelApi.getLabels().subscribe(ls => this.labels.set(ls));

    if (state?.transcript) {
      this.voiceApi.extract(state.transcript).subscribe({
        next: (r) => {
          this.captureResponse.set(r);
          const tasks: ConfirmTask[] = r.tasks.map(t => ({
            title: t.title,
            description: t.description,
            priority: mapPriority(t.priority),
            status: TaskStatus.ToDo,
            dueDate: t.dueDate,
            assigneeId: undefined,
            labelIds: [],
            subTasks: t.subtasks.map(s => ({ title: s.title })),
          }));
          this.cards.set(tasks);
          this.activeTasks.set(tasks);
          this.processing.set(false);
        },
        error: () => {
          this.processing.set(false);
          this.router.navigate(['/dashboard']);
        },
      });
    } else {
      this.processing.set(false);
      this.router.navigate(['/dashboard']);
    }
  }

  updateCard(i: number, card: ConfirmTask): void {
    this.cards.update(cs => cs.map((c, idx) => idx === i ? card : c));
    this.activeTasks.set(this.cards());
  }

  removeCard(i: number): void {
    this.cards.update(cs => cs.filter((_, idx) => idx !== i));
    this.activeTasks.set(this.cards());
  }

  addCard(): void {
    const blank: ConfirmTask = { title: '', priority: Priority.Medium, status: TaskStatus.ToDo, labelIds: [], subTasks: [] };
    this.cards.update(cs => [...cs, blank]);
    this.activeTasks.set(this.cards());
  }

  onAddLabel(ev: { name: string; colour: string }): void {
    this.labelApi.createLabel({ name: ev.name, colour: ev.colour }).subscribe(l => {
      this.labels.update(ls => [...ls, l]);
    });
  }

  confirm(): void {
    const resp = this.captureResponse();
    if (!resp) return;
    this.saving.set(true);
    this.voiceApi.confirm({ captureId: resp.captureId, tasks: this.cards() }).subscribe({
      next: () => this.router.navigate(['/dashboard']),
      error: () => this.saving.set(false),
    });
  }
}

function mapPriority(p: string): Priority {
  switch (p?.toLowerCase()) {
    case 'low': return Priority.Low;
    case 'high': return Priority.High;
    case 'critical': return Priority.Critical;
    default: return Priority.Medium;
  }
}
