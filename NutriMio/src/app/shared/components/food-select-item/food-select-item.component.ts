import { Component, EventEmitter, Input, Output } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  checkmarkCircle,
  ellipseOutline,
  removeOutline,
} from 'ionicons/icons';
import {
  formatPortionCount,
  getPortionCountFromConsumed,
  getPortionStepLabel,
  getReferenceQuantity,
  scaleFoodToQuantity,
} from '../../../core/utils/meal.utils';
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
  @Input() consumedQuantity: number | null = null;
  @Output() toggled = new EventEmitter<string>();
  @Output() consumedQuantityChanged = new EventEmitter<number>();

  constructor() {
    addIcons({ checkmarkCircle, ellipseOutline, removeOutline, addOutline });
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

  get displayPortionCount(): string {
    if (this.consumedQuantity == null) {
      return '';
    }

    return formatPortionCount(getPortionCountFromConsumed(this.food, this.consumedQuantity));
  }

  get portionLabel(): string {
    if (this.consumedQuantity == null) {
      return '';
    }

    const count = getPortionCountFromConsumed(this.food, this.consumedQuantity);
    return getPortionStepLabel(this.food.unit, count);
  }

  get canDecrement(): boolean {
    return this.consumedQuantity != null && this.consumedQuantity > this.referenceQuantity;
  }

  onToggle(): void {
    this.toggled.emit(this.food.id);
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

  onManualInput(event: Event): void {
    const value = Number((event.target as HTMLInputElement).value);

    if (!Number.isFinite(value) || value <= 0) {
      return;
    }

    this.consumedQuantityChanged.emit(value);
  }
}
