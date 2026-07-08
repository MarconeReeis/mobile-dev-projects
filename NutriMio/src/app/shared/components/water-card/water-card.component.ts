import { Component, EventEmitter, Input, Output } from '@angular/core';
import { DecimalPipe } from '@angular/common';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline, waterOutline } from 'ionicons/icons';
import { WaterSummary } from '../../../models';

@Component({
  selector: 'app-water-card',
  templateUrl: './water-card.component.html',
  styleUrls: ['./water-card.component.scss'],
  imports: [DecimalPipe, IonIcon],
})
export class WaterCardComponent {
  @Input({ required: true }) water!: WaterSummary;
  @Output() register = new EventEmitter<void>();

  constructor() {
    addIcons({ waterOutline, addOutline });
  }

  get hint(): string {
    if (this.water.current <= 0) {
      return 'Comece o dia com um copo de água.';
    }

    if (this.water.remaining <= 0) {
      return 'Meta de hidratação concluída! 🎉';
    }

    return `Faltam ${this.water.remaining} ml para a meta.`;
  }

  onRegister(event?: Event): void {
    event?.stopPropagation();
    this.register.emit();
  }
}
