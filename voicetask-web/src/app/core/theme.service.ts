import { Injectable, computed, effect, signal } from '@angular/core';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly _theme = signal<'dark' | 'light'>(
    (localStorage.getItem('vt-theme') as 'dark' | 'light') ?? 'dark'
  );

  readonly theme   = this._theme.asReadonly();
  readonly isDark  = computed(() => this._theme() === 'dark');
  readonly isLight = computed(() => this._theme() === 'light');

  constructor() {
    // Keep the <html data-theme="..."> attribute in sync
    effect(() => {
      const t = this._theme();
      document.documentElement.dataset['theme'] = t;

      // Keep the browser chrome colour in sync with the surface colour
      const meta = document.querySelector('meta[name="theme-color"]');
      if (meta) {
        meta.setAttribute('content', t === 'dark' ? '#272730' : '#f3f0f8');
      }
    });
  }

  toggle(): void {
    this._theme.update(t => (t === 'dark' ? 'light' : 'dark'));
    localStorage.setItem('vt-theme', this._theme());
  }

  /** Initialise from stored preference before first render */
  static init(): void {
    const stored = localStorage.getItem('vt-theme');
    if (stored) document.documentElement.dataset['theme'] = stored;
  }
}
