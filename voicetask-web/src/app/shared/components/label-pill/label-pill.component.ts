import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-label-pill',
  standalone: true,
  template: `
    <span class="label-pill" [style.--lc]="colour">
      <span class="swatch"></span>{{ name }}
    </span>
  `,
})
export class LabelPillComponent {
  @Input() name = '';
  @Input() colour = '';
}
