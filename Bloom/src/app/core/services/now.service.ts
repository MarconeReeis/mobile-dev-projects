import { Injectable, signal } from '@angular/core';
import { interval } from 'rxjs';

@Injectable({ providedIn: 'root' })
export class NowService {
  readonly now = signal(Date.now());

  constructor() {
    interval(1000).subscribe(() => this.now.set(Date.now()));
  }
}
