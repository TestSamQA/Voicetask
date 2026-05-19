import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../../shared/components/icon/icon.component';

@Component({
  selector: 'app-bell-button',
  standalone: true,
  imports: [IconComponent],
  template: `
    <button class="bell-btn" (click)="clicked.emit()" aria-label="Notifications">
      <app-icon name="bell" [size]="15" />
      @if (count > 0) { <span class="bell-badge">{{ count }}</span> }
    </button>
  `,
})
export class BellButtonComponent {
  @Input() count = 0;
  @Output() clicked = new EventEmitter<void>();
}
