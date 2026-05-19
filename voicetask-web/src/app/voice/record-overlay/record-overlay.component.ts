import { Component, EventEmitter, OnDestroy, OnInit, Output, signal } from '@angular/core';
import { BtnComponent } from '../../shared/components/btn/btn.component';

@Component({
  selector: 'app-record-overlay',
  standalone: true,
  imports: [BtnComponent],
  template: `
    <div class="record-overlay">
      <div class="record-stage">
        <div class="record-label">
          @if (listening()) {
            <span class="live-dot"></span>
            LISTENING
          } @else if (error()) {
            <span style="color:var(--danger)">ERROR</span>
          } @else {
            STARTING…
          }
        </div>

        <div class="record-transcript-box">
          @if (displayText()) {
            <p class="record-transcript-text">{{ displayText() }}</p>
          } @else {
            <p class="record-transcript-placeholder">Start speaking — say all your tasks at once.</p>
          }
        </div>

        @if (error()) {
          <p class="record-tip" style="color:var(--danger)">{{ error() }}</p>
        } @else {
          <p class="record-tip">
            Speak naturally — say multiple tasks if you have them.<br>
            Try "<span class="muted">First… Also… Don't forget to…</span>"
          </p>
        }

        <div class="record-actions">
          <app-btn icon="x" variant="ghost" size="lg" (click)="cancel.emit()">Cancel</app-btn>
          <app-btn icon="check" variant="primary" size="lg"
                   [disabled]="!canSubmit()"
                   (click)="done()">Done</app-btn>
        </div>
      </div>
    </div>
  `,
})
export class RecordOverlayComponent implements OnInit, OnDestroy {
  @Output() cancel = new EventEmitter<void>();
  @Output() stopped = new EventEmitter<string>();

  transcript = signal('');
  interim = signal('');
  listening = signal(false);
  error = signal('');

  displayText = signal('');
  canSubmit = signal(false);

  // eslint-disable-next-line @typescript-eslint/no-explicit-any
  private recognition: any = null;

  ngOnInit(): void {
    const SR = (window as any).SpeechRecognition ?? (window as any).webkitSpeechRecognition;
    if (!SR) {
      this.error.set('Speech recognition is not supported in this browser. Please use Chrome on Android.');
      return;
    }

    this.recognition = new SR();
    this.recognition.continuous = true;
    this.recognition.interimResults = true;
    this.recognition.lang = 'en-US';

    this.recognition.onstart = () => this.listening.set(true);
    this.recognition.onend = () => {
      this.listening.set(false);
      this.updateDisplay();
    };
    this.recognition.onerror = (e: any) => {
      if (e.error !== 'no-speech' && e.error !== 'aborted') {
        this.error.set(`Recognition error: ${e.error}`);
      }
      this.listening.set(false);
    };
    this.recognition.onresult = (e: any) => {
      let finals = '';
      let interim = '';
      for (let i = 0; i < e.results.length; i++) {
        if (e.results[i].isFinal) {
          finals += e.results[i][0].transcript + ' ';
        } else {
          interim += e.results[i][0].transcript;
        }
      }
      this.transcript.set(finals.trim());
      this.interim.set(interim);
      this.updateDisplay();
    };

    this.recognition.start();
  }

  ngOnDestroy(): void {
    this.recognition?.abort();
  }

  private updateDisplay(): void {
    const combined = [this.transcript(), this.interim()].filter(Boolean).join(' ').trim();
    this.displayText.set(combined);
    this.canSubmit.set(!!combined);
  }

  done(): void {
    const text = [this.transcript(), this.interim()].filter(Boolean).join(' ').trim();
    if (!text) { this.cancel.emit(); return; }
    this.recognition?.stop();
    this.stopped.emit(text);
  }
}
