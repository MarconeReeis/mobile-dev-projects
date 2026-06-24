import { Component, Input } from '@angular/core';
import { MealSummary } from '../../../models';
import { FormatNutritionPipe } from '../../pipes/format-nutrition.pipe';

@Component({
  selector: 'app-meal-summary-card',
  templateUrl: './meal-summary-card.component.html',
  styleUrls: ['./meal-summary-card.component.scss'],
  imports: [FormatNutritionPipe],
})
export class MealSummaryCardComponent {
  @Input({ required: true }) summary!: MealSummary;
}
