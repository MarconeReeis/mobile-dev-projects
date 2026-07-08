import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, closeOutline, trashOutline, waterOutline } from 'ionicons/icons';
import { WATER_QUICK_ADD_OPTIONS, WaterSummary } from '../../../models';

@Component({
  selector: 'app-water-tracker-modal',
  templateUrl: './water-tracker-modal.component.html',
  styleUrls: ['./water-tracker-modal.component.scss'],
  imports: [DecimalPipe, FormsModule, IonIcon],
})
export class WaterTrackerModalComponent {
  @Input({ required: true }) water!: WaterSummary;
  @Output() add = new EventEmitter<number>();
  @Output() remove = new EventEmitter<string>();
  @Output() dismiss = new EventEmitter<void>();

  readonly quickOptions = WATER_QUICK_ADD_OPTIONS;
  customAmount: number | null = null;

  constructor() {
    addIcons({ waterOutline, addOutline, closeOutline, trashOutline });
  }

  onQuickAdd(amount: number): void {
    this.add.emit(amount);
  }

  onAddCustom(): void {
    const amount = Math.round(this.customAmount ?? 0);

    if (!Number.isFinite(amount) || amount <= 0) {
      return;
    }

    this.add.emit(amount);
    this.customAmount = null;
  }

  onRemove(entryId: string): void {
    this.remove.emit(entryId);
  }

  onClose(): void {
    this.dismiss.emit();
  }

  get isCustomValid(): boolean {
    return !!this.customAmount && this.customAmount > 0;
  }
}
