import { Component, Input } from '@angular/core';
import { WeekBar } from '../../../models';

@Component({
  selector: 'app-week-chart',
  templateUrl: './week-chart.component.html',
  styleUrls: ['./week-chart.component.scss'],
})
export class WeekChartComponent {
  @Input({ required: true }) bars: WeekBar[] = [];
  @Input() goal = 2300;
  @Input() fillColor = 'var(--nutrimio-progress-track)';
  @Input() activeFillColor = 'var(--ion-color-primary)';
  @Input() activeLabelColor = 'var(--ion-color-primary)';

  get maxValue(): number {
    const maxBar = Math.max(...this.bars.map((bar) => bar.value), 0);
    return Math.max(this.goal, maxBar, 1);
  }

  barHeight(value: number): number {
    return (value / this.maxValue) * 100;
  }
}
