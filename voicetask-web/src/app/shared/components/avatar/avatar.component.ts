import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-avatar',
  standalone: true,
  template: `
    <div class="avatar" [class.sm]="size === 'sm'" [class.lg]="size === 'lg'"
         [style.background]="bg" [style.color]="fg">
      {{ initials }}
    </div>
  `,
})
export class AvatarComponent {
  @Input() name = '';
  @Input() size: 'sm' | 'md' | 'lg' = 'md';

  get initials(): string {
    return (this.name || '?').split(' ').map(w => w[0]).slice(0, 2).join('');
  }

  get hue(): number {
    return [...(this.name || '?')].reduce((a, c) => a + c.charCodeAt(0), 0) % 360;
  }

  get bg(): string { return `oklch(28% 0.04 ${this.hue})`; }
  get fg(): string { return `oklch(85% 0.06 ${this.hue})`; }
}
