import { Component, Input } from '@angular/core';
import { MonthTrendPoint } from '../../../models';

@Component({
  selector: 'app-month-trend-chart',
  templateUrl: './month-trend-chart.component.html',
  styleUrls: ['./month-trend-chart.component.scss'],
})
export class MonthTrendChartComponent {
  @Input({ required: true }) points: MonthTrendPoint[] = [];

  get linePath(): string {
    if (!this.points.length) {
      return '';
    }

    return this.points.map((point, index) => `${index === 0 ? 'M' : 'L'} ${point.x} ${point.y}`).join(' ');
  }

  get areaPath(): string {
    if (!this.points.length) {
      return '';
    }

    const last = this.points[this.points.length - 1];
    const first = this.points[0];
    const baseY = 80;

    return `${this.linePath} L ${last.x} ${baseY} L ${first.x} ${baseY} Z`;
  }
}
