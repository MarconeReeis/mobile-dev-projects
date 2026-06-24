import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  checkmarkCircle,
  ellipseOutline,
  removeOutline,
  trashOutline,
} from 'ionicons/icons';
import {
  getReferenceQuantity,
  scaleFoodToQuantity,
} from '../../../core/utils/meal.utils';
import { Food, MacroNutrients } from '../../../models';
import { FormatNutritionPipe } from '../../pipes/format-nutrition.pipe';

@Component({
  selector: 'app-food-select-item',
  templateUrl: './food-select-item.component.html',
  styleUrls: ['./food-select-item.component.scss'],
  imports: [IonIcon, FormatNutritionPipe],
})
export class FoodSelectItemComponent {
  @Input({ required: true }) food!: Food;
  @Input() selected = false;
  @Input() consumedQuantity: number | null = null;
  @Output() toggled = new EventEmitter<string>();
  @Output() consumedQuantityChanged = new EventEmitter<number>();
  @Output() removed = new EventEmitter<string>();

  constructor() {
    addIcons({
      checkmarkCircle,
      ellipseOutline,
      removeOutline,
      addOutline,
      trashOutline,
    });
  }

  get referenceQuantity(): number {
    return getReferenceQuantity(this.food);
  }

  get scaledFood(): Food | null {
    if (!this.selected || this.consumedQuantity == null || this.consumedQuantity <= 0) {
      return null;
    }

    return scaleFoodToQuantity(this.food, this.consumedQuantity);
  }

  get displayMacros(): MacroNutrients {
    return this.scaledFood?.macros ?? this.food.macros;
  }

  get canDecrement(): boolean {
    return this.consumedQuantity != null && this.consumedQuantity > this.referenceQuantity;
  }

  formatQuantity(value: number): string {
    return Number.isInteger(value) ? String(value) : value.toFixed(1);
  }

  onToggle(): void {
    this.toggled.emit(this.food.id);
  }

  onRemove(): void {
    this.removed.emit(this.food.id);
  }

  decrement(): void {
    if (!this.canDecrement || this.consumedQuantity == null) {
      return;
    }

    this.consumedQuantityChanged.emit(this.consumedQuantity - this.referenceQuantity);
  }

  increment(): void {
    if (this.consumedQuantity == null) {
      return;
    }

    this.consumedQuantityChanged.emit(this.consumedQuantity + this.referenceQuantity);
  }
}
