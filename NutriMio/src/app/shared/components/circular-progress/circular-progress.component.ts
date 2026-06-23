import { Component, Input } from '@angular/core';

@Component({
  selector: 'app-circular-progress',
  templateUrl: './circular-progress.component.html',
  styleUrls: ['./circular-progress.component.scss'],
})
export class CircularProgressComponent {
  @Input({ required: true }) progress = 0;
  @Input() label = 'META';
  @Input() color = 'var(--ion-color-primary)';

  get dashOffset(): number {
    const circumference = 2 * Math.PI * 15.9155;
    const clamped = Math.min(Math.max(this.progress, 0), 100);
    return circumference - (clamped / 100) * circumference;
  }
}
