import { Component, computed, inject, signal } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { addOutline } from 'ionicons/icons';
import { Habit, HabitFormValues } from '../../core/models/habit.model';
import { NowService } from '../../core/services/now.service';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { HabitFormModalComponent } from '../habits/components/habit-form-modal/habit-form-modal.component';
import { HabitService } from '../habits/services/habit.service';
import { calcDuration, dailyQuote } from '../habits/utils/habit.utils';
import { HabitCardComponent } from './components/habit-card/habit-card.component';

addIcons({ addOutline });

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    ThemeToggleComponent,
    HabitCardComponent,
  ],
})
export class DashboardPage {
  private readonly habitService = inject(HabitService);
  private readonly modalCtrl = inject(ModalController);
  private readonly nowService = inject(NowService);

  readonly habits = this.habitService.habits;
  readonly isEmpty = this.habitService.isEmpty;
  readonly quote = dailyQuote();
  readonly editingHabit = signal<Habit | null>(null);

  readonly topStreakDays = computed(() => {
    const habits = this.habits();
    if (!habits.length) {
      return 0;
    }

    const now = this.nowService.now();
    return Math.max(...habits.map((habit) => calcDuration(habit.startedAt, now).days));
  });

  async openCreateModal(): Promise<void> {
    this.editingHabit.set(null);
    await this.openModal(null);
  }

  async openEditModal(habit: Habit): Promise<void> {
    this.editingHabit.set(habit);
    await this.openModal(habit);
  }

  onRelapse(habitId: string): void {
    this.habitService.recordRelapse(habitId);
  }

  onDelete(habitId: string): void {
    this.habitService.deleteHabit(habitId);
  }

  private async openModal(habit: Habit | null): Promise<void> {
    const modal = await this.modalCtrl.create({
      component: HabitFormModalComponent,
      componentProps: { initial: habit },
      cssClass: 'habit-form-modal',
      backdropDismiss: true,
      showBackdrop: true,
    });

    await modal.present();

    const { data, role } = await modal.onWillDismiss<HabitFormValues>();
    this.editingHabit.set(null);

    if (role !== 'confirm' || !data) {
      return;
    }

    if (habit) {
      this.habitService.updateHabit(habit.id, data);
    } else {
      this.habitService.addHabit(data);
    }
  }
}
