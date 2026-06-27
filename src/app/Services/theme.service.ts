import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class ThemeService {
  private readonly isDarkSubject = new BehaviorSubject<boolean>(false);
  readonly isDarkMode$ = this.isDarkSubject.asObservable();

  constructor() {
    this.initTheme();
  }

  initTheme(): void {
    if (typeof window !== 'undefined') {
      const saved = localStorage.getItem('theme');
      const isDark = saved === 'dark';
      this.isDarkSubject.next(isDark);
      document.body.classList.toggle('dark-theme', isDark);
    }
  }

  get isDarkMode(): boolean {
    return this.isDarkSubject.value;
  }

  toggleTheme(): boolean {
    const nextVal = !this.isDarkSubject.value;
    this.isDarkSubject.next(nextVal);
    if (typeof window !== 'undefined') {
      document.body.classList.toggle('dark-theme', nextVal);
      try {
        localStorage.setItem('theme', nextVal ? 'dark' : 'light');
      } catch (e) {}
    }
    return nextVal;
  }
}
