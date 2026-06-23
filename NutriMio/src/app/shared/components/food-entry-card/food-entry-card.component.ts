import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { trashOutline } from 'ionicons/icons';
import { FoodEntry } from '../../../models';

@Component({
  selector: 'app-food-entry-card',
  templateUrl: './food-entry-card.component.html',
  styleUrls: ['./food-entry-card.component.scss'],
  imports: [IonIcon],
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
