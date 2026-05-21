import { DOCUMENT, isPlatformBrowser } from '@angular/common';
import { Injectable, PLATFORM_ID, inject, signal } from '@angular/core';

type Theme = 'light' | 'dark';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly document = inject(DOCUMENT);
  private readonly platformId = inject(PLATFORM_ID);
  private readonly isBrowser = isPlatformBrowser(this.platformId);
  private readonly storageKey = 'cineverse-theme';

  readonly isDark = signal(false);

  constructor() {
    const storedTheme = this.readStoredTheme();
    const prefersDark = this.isBrowser && window.matchMedia('(prefers-color-scheme: dark)').matches;

    this.applyTheme(storedTheme ?? (prefersDark ? 'dark' : 'light'), false);
  }

  toggleTheme(): void {
    this.applyTheme(this.isDark() ? 'light' : 'dark');
  }

  private applyTheme(theme: Theme, persist = true): void {
    this.isDark.set(theme === 'dark');
    this.document.documentElement.dataset['theme'] = theme;
    this.document.documentElement.style.colorScheme = theme;

    if (this.isBrowser && persist) {
      localStorage.setItem(this.storageKey, theme);
    }
  }

  private readStoredTheme(): Theme | null {
    if (!this.isBrowser) {
      return null;
    }

    const theme = localStorage.getItem(this.storageKey);
    return theme === 'dark' || theme === 'light' ? theme : null;
  }
}
