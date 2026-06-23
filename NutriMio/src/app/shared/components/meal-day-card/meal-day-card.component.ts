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
import { MEAL_TYPE_ICONS, MealCategorySlot } from '../../../models';

@Component({
  selector: 'app-meal-day-card',
  templateUrl: './meal-day-card.component.html',
  styleUrls: ['./meal-day-card.component.scss'],
  imports: [IonIcon],
})
export class MealDayCardComponent {
  @Input({ required: true }) slot!: MealCategorySlot;

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
    return MEAL_TYPE_ICONS[this.slot.type];
  }
}
