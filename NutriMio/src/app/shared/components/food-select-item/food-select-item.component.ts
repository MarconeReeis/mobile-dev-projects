import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { checkmarkCircle, ellipseOutline } from 'ionicons/icons';
import { Food } from '../../../models';

@Component({
  selector: 'app-food-select-item',
  templateUrl: './food-select-item.component.html',
  styleUrls: ['./food-select-item.component.scss'],
  imports: [IonIcon],
})
export class FoodSelectItemComponent {
  @Input({ required: true }) food!: Food;
  @Input() selected = false;
  @Output() toggled = new EventEmitter<string>();

  constructor() {
    addIcons({ checkmarkCircle, ellipseOutline });
  }

  onToggle(): void {
    this.toggled.emit(this.food.id);
  }
}
