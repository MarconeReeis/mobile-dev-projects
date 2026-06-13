import { Component, computed, inject, signal } from '@angular/core';
import {
  IonButton,
  IonContent,
  IonIcon,
  ModalController,
} from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  addOutline,
  sparklesOutline,
  trophyOutline,
  trendingUpOutline,
  walletOutline,
} from 'ionicons/icons';
import { Habit, HabitFormValues } from '../../core/models/habit.model';
import { NowService } from '../../core/services/now.service';
import { AuthMenuComponent } from '../../shared/components/auth-menu/auth-menu.component';
import { ThemeToggleComponent } from '../../shared/components/theme-toggle/theme-toggle.component';
import { HabitFormModalComponent } from '../habits/components/habit-form-modal/habit-form-modal.component';
import { HabitService } from '../habits/services/habit.service';
import { calcDuration, dailyQuote, formatCurrency } from '../habits/utils/habit.utils';
import {
  calcFinancialSummary,
  pickCuriosityPhrases,
} from '../habits/utils/savings.utils';
import { HabitCardComponent } from './components/habit-card/habit-card.component';

addIcons({
  addOutline,
  sparklesOutline,
  trophyOutline,
  trendingUpOutline,
  walletOutline,
});

@Component({
  selector: 'app-dashboard',
  templateUrl: './dashboard.page.html',
  styleUrls: ['./dashboard.page.scss'],
  imports: [
    IonContent,
    IonButton,
    IonIcon,
    ThemeToggleComponent,
    AuthMenuComponent,
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

  readonly financialSummary = computed(() =>
    calcFinancialSummary(this.habits(), this.nowService.now())
  );

  readonly hasFinancialData = computed(() => this.financialSummary().hasData);

  readonly totalSavedLabel = computed(() =>
    formatCurrency(this.financialSummary().totalSaved)
  );

  readonly topIndividualSavedLabel = computed(() =>
    formatCurrency(this.financialSummary().topIndividualSaved)
  );

  readonly monthlyAverageLabel = computed(() =>
    formatCurrency(this.financialSummary().monthlyAverage)
  );

  readonly curiosityPhrases = computed(() =>
    pickCuriosityPhrases(this.financialSummary().totalSaved)
  );

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
