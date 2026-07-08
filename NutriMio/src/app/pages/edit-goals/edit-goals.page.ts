import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Location } from '@angular/common';
import { IonContent, IonIcon, IonInput, IonToggle } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  caretDownOutline,
  caretUpOutline,
  notificationsOutline,
  removeOutline,
  saveOutline,
  trendingDownOutline,
  trendingUpOutline,
  waterOutline,
} from 'ionicons/icons';
import {
  FITNESS_OBJECTIVE_LABELS,
  FITNESS_OBJECTIVE_OPTIONS,
  FITNESS_OBJECTIVE_SUMMARY,
  calculateSuggestedGoals,
  calculateSuggestedWaterGoal,
  getWaterMlPerKg,
} from '../../core/utils/goals-calculator';
import { FitnessObjective, MacroGoals, UserSettings, UserWeight } from '../../models';
import { NutritionService } from '../../services/nutrition.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit-goals',
  templateUrl: './edit-goals.page.html',
  styleUrls: ['./edit-goals.page.scss'],
  imports: [FormsModule, DecimalPipe, IonContent, IonInput, IonIcon, IonToggle],
})
export class EditGoalsPage implements OnInit {
  private readonly location = inject(Location);
  private readonly userService = inject(UserService);
  private readonly nutritionService = inject(NutritionService);

  readonly objectiveOptions = FITNESS_OBJECTIVE_OPTIONS;
  readonly objectiveLabels = FITNESS_OBJECTIVE_LABELS;
  readonly reminderOptions: Array<UserSettings['hydrationReminderInterval']> = ['1h', '2h', 'off'];

  currentWeight = 72;
  targetWeight = 68;
  age = 30;
  objective: FitnessObjective = 'lose';
  goals: MacroGoals = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, waterMl: 0 };
  waterGoalAuto = true;
  hydrationReminderInterval: UserSettings['hydrationReminderInterval'] = 'off';
  isSaving = false;

  constructor() {
    addIcons({
      arrowBackOutline,
      saveOutline,
      trendingDownOutline,
      removeOutline,
      trendingUpOutline,
      caretUpOutline,
      caretDownOutline,
      waterOutline,
      notificationsOutline,
    });
  }

  ngOnInit(): void {
    const user = this.userService.getUser();
    this.loadFromUser(user);
  }

  get objectiveSummary(): string {
    return FITNESS_OBJECTIVE_SUMMARY[this.objective];
  }

  get waterMlPerKg(): number {
    return getWaterMlPerKg(this.age);
  }

  goBack(): void {
    this.location.back();
  }

  selectObjective(objective: FitnessObjective): void {
    this.objective = objective;
    this.applySuggestedGoals();
  }

  onWeightChange(): void {
    this.applySuggestedGoals();
  }

  onAgeChange(): void {
    this.syncAutoWaterGoal();
  }

  onWaterGoalAutoChange(enabled: boolean): void {
    this.waterGoalAuto = enabled;
    this.syncAutoWaterGoal();
  }

  adjustCalories(delta: number): void {
    this.goals = {
      ...this.goals,
      calories: Math.max(0, this.goals.calories + delta),
    };
    this.recalculateCarbsFromCalories();
  }

  onCaloriesChange(): void {
    this.recalculateCarbsFromCalories();
  }

  private loadFromUser(user: ReturnType<UserService['getUser']>): void {
    this.currentWeight = user.weight.current;
    this.targetWeight = user.weight.goal;
    this.age = user.age;
    this.objective = user.fitnessObjective;
    this.goals = { ...user.goals };
    this.waterGoalAuto = user.settings.waterGoalAuto;
    this.hydrationReminderInterval = user.settings.hydrationReminderInterval;
  }

  private applySuggestedGoals(): void {
    const suggested = calculateSuggestedGoals({
      currentWeight: this.currentWeight,
      objective: this.objective,
      age: this.age,
    });
    const waterMl = this.waterGoalAuto
      ? suggested.waterMl
      : this.goals.waterMl;

    this.goals = {
      ...suggested,
      waterMl,
    };
  }

  private syncAutoWaterGoal(): void {
    if (!this.waterGoalAuto) {
      return;
    }

    this.goals = {
      ...this.goals,
      waterMl: calculateSuggestedWaterGoal(this.currentWeight, this.age),
    };
  }

  private recalculateCarbsFromCalories(): void {
    const remainingKcal = Math.max(
      0,
      this.goals.calories - this.goals.protein * 4 - this.goals.fat * 9,
    );
    this.goals = {
      ...this.goals,
      carbs: Math.round(remainingKcal / 4),
    };
  }

  async onSave(): Promise<void> {
    if (this.isSaving) {
      return;
    }

    this.isSaving = true;

    const user = this.userService.getUser();
    const weight: UserWeight = {
      ...user.weight,
      current: this.currentWeight,
      goal: this.targetWeight,
    };
    const settings: UserSettings = {
      ...user.settings,
      waterGoalAuto: this.waterGoalAuto,
      hydrationReminderInterval: this.hydrationReminderInterval,
    };

    try {
      await this.userService.updateGoalsProfile({
        goals: { ...this.goals },
        weight,
        fitnessObjective: this.objective,
        age: this.age,
        settings,
      });
      await this.nutritionService.refreshToday();
      this.goBack();
    } finally {
      this.isSaving = false;
    }
  }
}
