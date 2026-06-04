import { Component, computed, inject, input, output } from '@angular/core';
import {
  AlertController,
  IonButton,
  IonIcon,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  createOutline,
  flameOutline,
  refreshOutline,
  trashOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import { Habit } from '../../../../core/models/habit.model';
import { NowService } from '../../../../core/services/now.service';
import {
  calcDuration,
  formatDateTime,
  getLongestStreakDays,
} from '../../../habits/utils/habit.utils';

addIcons({
  createOutline,
  flameOutline,
  refreshOutline,
  trashOutline,
  trendingUpOutline,
});

@Component({
  selector: 'app-habit-card',
  templateUrl: './habit-card.component.html',
  styleUrls: ['./habit-card.component.scss'],
  imports: [IonButton, IonIcon],
})
export class HabitCardComponent {
  private readonly alertCtrl = inject(AlertController);
  private readonly nowService = inject(NowService);

  readonly habit = input.required<Habit>();
  readonly edit = output<Habit>();
  readonly relapse = output<string>();
  readonly delete = output<string>();

  readonly duration = computed(() =>
    calcDuration(this.habit().startedAt, this.nowService.now())
  );

  readonly longestDays = computed(() =>
    getLongestStreakDays(this.habit(), this.duration().totalMs)
  );

  readonly startedAtLabel = computed(() => formatDateTime(this.habit().startedAt));

  pad(value: number): string {
    return String(value).padStart(2, '0');
  }

  onEdit(): void {
    this.edit.emit(this.habit());
  }

  async onDelete(): Promise<void> {
    const alert = await this.alertCtrl.create({
      header: `Excluir "${this.habit().name}"?`,
      message: 'Essa ação não pode ser desfeita.',
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Excluir',
          role: 'destructive',
          handler: () => this.delete.emit(this.habit().id),
        },
      ],
    });

    await alert.present();
  }

  async onRelapse(): Promise<void> {
    const days = this.duration().days;

    const alert = await this.alertCtrl.create({
      header: 'Confirmar recaída?',
      message: `O contador de "${this.habit().name}" será reiniciado para agora. Sua sequência atual de ${days} dias será salva como recorde, se for a maior.`,
      buttons: [
        { text: 'Cancelar', role: 'cancel' },
        {
          text: 'Confirmar',
          role: 'destructive',
          handler: () => this.relapse.emit(this.habit().id),
        },
      ],
    });

    await alert.present();
  }
}
