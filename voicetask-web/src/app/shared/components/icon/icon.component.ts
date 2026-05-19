import { Component, Input } from '@angular/core';
import { DomSanitizer, SafeHtml } from '@angular/platform-browser';

const ICONS: Record<string, string> = {
  mic: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="6" y="2" width="4" height="8" rx="2"/><path d="M3.5 7.5a4.5 4.5 0 0 0 9 0M8 12v2.5M5.5 14.5h5"/></svg>`,
  inbox: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2 9.5V13a1 1 0 0 0 1 1h10a1 1 0 0 0 1-1V9.5"/><path d="M2 9.5h3l1 2h4l1-2h3M3.5 9.5l1.5-6h6l1.5 6"/></svg>`,
  user: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="5.5" r="2.5"/><path d="M3 14c0-2.5 2.2-4.5 5-4.5s5 2 5 4.5"/></svg>`,
  users: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="6" cy="5.5" r="2.5"/><path d="M2 13.5c0-2 1.8-3.5 4-3.5s4 1.5 4 3.5"/><path d="M10.5 4.5a2.5 2.5 0 0 1 0 5M11 13.5c0-1.4-.8-2.6-2-3.2"/></svg>`,
  list: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5.5 4h8M5.5 8h8M5.5 12h8M2.5 4h.5M2.5 8h.5M2.5 12h.5"/></svg>`,
  home: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 7.5L8 3l5.5 4.5V13a1 1 0 0 1-1 1h-9a1 1 0 0 1-1-1V7.5z"/><path d="M6.5 14V10h3v4"/></svg>`,
  settings: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="8" cy="8" r="2"/><path d="M8 1.5v1.8M8 12.7v1.8M14.5 8h-1.8M3.3 8H1.5M12.6 3.4l-1.3 1.3M4.7 11.3l-1.3 1.3M12.6 12.6l-1.3-1.3M4.7 4.7L3.4 3.4"/></svg>`,
  bell: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 11.5h9l-1-1.5V7a3.5 3.5 0 0 0-7 0v3l-1 1.5z"/><path d="M6.5 13a1.5 1.5 0 0 0 3 0"/></svg>`,
  plus: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M8 3v10M3 8h10"/></svg>`,
  x: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M4 4l8 8M12 4l-8 8"/></svg>`,
  check: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 8.5l3 3 6-6"/></svg>`,
  chevronR: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6 3.5L10.5 8 6 12.5"/></svg>`,
  chevronL: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M10 3.5L5.5 8 10 12.5"/></svg>`,
  chevronD: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 6L8 10.5 12.5 6"/></svg>`,
  calendar: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="2.5" y="3.5" width="11" height="10" rx="1.5"/><path d="M2.5 6.5h11M5.5 2v3M10.5 2v3"/></svg>`,
  flag: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 14V2.5M3.5 3h8l-1.5 2.5L11.5 8h-8"/></svg>`,
  link: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M6.5 9.5l3-3M9 5l1-1a2.5 2.5 0 0 1 3.5 3.5l-1.5 1.5M7 11l-1.5 1.5A2.5 2.5 0 0 1 2 9l1.5-1.5"/></svg>`,
  more: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="3.5" cy="8" r=".8" fill="currentColor"/><circle cx="8" cy="8" r=".8" fill="currentColor"/><circle cx="12.5" cy="8" r=".8" fill="currentColor"/></svg>`,
  trash: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 4.5h10M5.5 4.5V3a1 1 0 0 1 1-1h3a1 1 0 0 1 1 1v1.5M4.5 4.5L5 13a1 1 0 0 0 1 1h4a1 1 0 0 0 1-1l.5-8.5"/></svg>`,
  edit: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M11 2.5l2.5 2.5L6 12.5l-3 .5.5-3z"/></svg>`,
  play: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M5 3.5v9l7-4.5z" fill="currentColor"/></svg>`,
  stop: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><rect x="4" y="4" width="8" height="8" rx="1.5" fill="currentColor"/></svg>`,
  sparkle: `<svg viewBox="0 0 16 16" fill="currentColor" stroke="none"><path d="M8 2L9 6.5 13.5 8 9 9.5 8 14 7 9.5 2.5 8 7 6.5z"/></svg>`,
  arrowR: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3 8h10M9 4l4 4-4 4"/></svg>`,
  search: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><circle cx="7" cy="7" r="4"/><path d="M10 10l3 3"/></svg>`,
  filter: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 4h11M4.5 8h7M6.5 12h3"/></svg>`,
  repeat: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M3.5 7.5V6a2 2 0 0 1 2-2h6.5M12.5 8.5V10a2 2 0 0 1-2 2H4"/><path d="M11 2.5L12.5 4 11 5.5M5 10.5L3.5 12 5 13.5"/></svg>`,
  tag: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8V3.5h4.5L13.5 10l-5.5 5L2.5 9z"/><circle cx="5.5" cy="6.5" r=".8" fill="currentColor"/></svg>`,
  label: `<svg viewBox="0 0 16 16" fill="none" stroke="currentColor" stroke-linecap="round" stroke-linejoin="round"><path d="M2.5 8V3.5h4.5L13.5 10l-5.5 5L2.5 9z"/><circle cx="5.5" cy="6.5" r=".8" fill="currentColor"/></svg>`,
};

@Component({
  selector: 'app-icon',
  standalone: true,
  template: `<span [style.display]="'inline-flex'" [style.width.px]="size" [style.height.px]="size" [innerHTML]="svg"></span>`,
})
export class IconComponent {
  @Input() name = '';
  @Input() size = 14;

  constructor(private sanitizer: DomSanitizer) {}

  get svg(): SafeHtml {
    const raw = ICONS[this.name] ?? '';
    const withSize = raw.replace('<svg ', `<svg width="${this.size}" height="${this.size}" stroke-width="1.5" `);
    return this.sanitizer.bypassSecurityTrustHtml(withSize);
  }
}
