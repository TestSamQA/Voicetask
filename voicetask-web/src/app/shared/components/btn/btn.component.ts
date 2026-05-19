import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IconComponent } from '../icon/icon.component';

@Component({
  selector: 'app-btn',
  standalone: true,
  imports: [IconComponent],
  template: `
    <button [class]="cls" (click)="click.emit($event)" [disabled]="disabled" [type]="type">
      @if (icon) { <app-icon [name]="icon" [size]="size === 'xl' || size === 'lg' ? 14 : 12" /> }
      <ng-content />
    </button>
  `,
})
export class BtnComponent {
  @Input() variant: 'default' | 'primary' | 'ghost' | 'danger' | 'icon' = 'default';
  @Input() icon = '';
  @Input() size: 'sm' | 'md' | 'lg' | 'xl' | '' = '';
  @Input() disabled = false;
  @Input() type: 'button' | 'submit' = 'button';
  @Output() click = new EventEmitter<MouseEvent>();

  get cls(): string {
    return ['btn', this.variant !== 'default' ? this.variant : '', this.size].filter(Boolean).join(' ');
  }
}
