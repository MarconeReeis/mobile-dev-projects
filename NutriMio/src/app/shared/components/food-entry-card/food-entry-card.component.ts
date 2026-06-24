import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { FoodEntry } from '../../../models';

import { FormatNutritionPipe } from '../../pipes/format-nutrition.pipe';

@Component({
  selector: 'app-food-entry-card',
  templateUrl: './food-entry-card.component.html',
  styleUrls: ['./food-entry-card.component.scss'],
  imports: [IonIcon, FormatNutritionPipe],
})
export class FoodEntryCardComponent {
  @Input({ required: true }) food!: FoodEntry;
  @Output() remove = new EventEmitter<string>();

  constructor() {
    addIcons({ trashOutline });
  }

  onRemove(): void {
    this.remove.emit(this.food.id);
  }
}
