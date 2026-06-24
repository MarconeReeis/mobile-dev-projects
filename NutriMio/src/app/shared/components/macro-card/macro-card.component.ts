import { Component, Input } from '@angular/core';
import { MacroSummary } from '../../../models';
import { FormatNutritionPipe } from '../../pipes/format-nutrition.pipe';

@Component({
  selector: 'app-macro-card',
  templateUrl: './macro-card.component.html',
  styleUrls: ['./macro-card.component.scss'],
  imports: [FormatNutritionPipe],
})
export class MacroCardComponent {
  @Input({ required: true }) macro!: MacroSummary;
}
