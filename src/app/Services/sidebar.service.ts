import { Injectable } from '@angular/core';
import { BehaviorSubject } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class SidebarService {
  private readonly open$ = new BehaviorSubject<boolean>(false);

  readonly isOpen$ = this.open$.asObservable();

  toggle(): void {
    this.open$.next(!this.open$.value);
  }

  close(): void {
    this.open$.next(false);
  }

  get isOpen(): boolean {
    return this.open$.value;
  }
}
