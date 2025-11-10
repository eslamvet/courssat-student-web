import { effect, Injectable, signal } from '@angular/core';

@Injectable({
  providedIn: 'root',
})
export class ThemeService {
  private theme = signal(
    localStorage.getItem('theme') ??
      (window.matchMedia('(prefers-color-scheme: dark)').matches ? 'dark' : 'light')
  );
  readonly currentTheme = this.theme.asReadonly();
  constructor() {
    effect(() => {
      document.documentElement.setAttribute('data-theme', this.theme());
      localStorage.setItem('theme', this.theme());
    });
  }

  toggleTheme() {
    this.theme.update((prev) => (prev == 'dark' ? 'light' : 'dark'));
  }
}
