import { Component, Input } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  bedOutline,
  cafeOutline,
  chevronForwardOutline,
  moonOutline,
  nutritionOutline,
  sunnyOutline,
} from 'ionicons/icons';
import { MEAL_TYPE_ICONS, MealLogEntry } from '../../../models';

@Component({
  selector: 'app-meal-item',
  templateUrl: './meal-item.component.html',
  styleUrls: ['./meal-item.component.scss'],
  imports: [IonIcon],
})
export class MealItemComponent {
  @Input({ required: true }) meal!: MealLogEntry;

  constructor() {
    addIcons({
      chevronForwardOutline,
      cafeOutline,
      sunnyOutline,
      moonOutline,
      nutritionOutline,
      bedOutline,
    });
  }

  get icon(): string {
    return MEAL_TYPE_ICONS[this.meal.type];
  }
}
