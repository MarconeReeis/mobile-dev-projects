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

  get maxValue(): number {
    const maxBar = Math.max(...this.bars.map((bar) => bar.calories), 0);
    return Math.max(this.goal, maxBar, 1);
  }

  barHeight(calories: number): number {
    return (calories / this.maxValue) * 100;
  }
}
