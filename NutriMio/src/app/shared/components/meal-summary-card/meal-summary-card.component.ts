import { Component, Input } from '@angular/core';
import { MealSummary } from '../../../models';

@Component({
  selector: 'app-meal-summary-card',
  templateUrl: './meal-summary-card.component.html',
  styleUrls: ['./meal-summary-card.component.scss'],
})
export class MealSummaryCardComponent {
  @Input({ required: true }) summary!: MealSummary;
}
