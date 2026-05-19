import { Component } from '@angular/core';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-processing-overlay',
  standalone: true,
  imports: [IconComponent],
  template: `
    <div class="record-overlay" style="background: oklch(13% 0.006 270 / .9)">
      <div class="record-stage">
        <div class="record-label" style="color: var(--accent)">
          <app-icon name="sparkle" [size]="12" />
          PROCESSING
        </div>
        <div class="record-timer">Transcribing…</div>
        <div class="hstack" style="gap: 4px;">
          @for (i of [0,1,2,3]; track i) {
            <span [style]="dotStyle(i)"></span>
          }
        </div>
        <p class="record-tip">
          Whisper is transcribing the audio, then Claude will pull out the tasks.
        </p>
      </div>
    </div>
  `,
})
export class ProcessingOverlayComponent {
  dotStyle(i: number): string {
    return `width:8px;height:8px;border-radius:99px;background:var(--accent);opacity:0.3;animation:blink 1.2s ease-in-out ${i * 0.15}s infinite`;
  }
}
