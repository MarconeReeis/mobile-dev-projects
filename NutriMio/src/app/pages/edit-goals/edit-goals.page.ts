import { Component, OnInit, inject } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { DecimalPipe } from '@angular/common';
import { Location } from '@angular/common';
import { IonContent, IonIcon, IonInput } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  arrowBackOutline,
  caretDownOutline,
  caretUpOutline,
  removeOutline,
  saveOutline,
  trendingDownOutline,
  trendingUpOutline,
} from 'ionicons/icons';
import {
  FITNESS_OBJECTIVE_LABELS,
  FITNESS_OBJECTIVE_OPTIONS,
  FITNESS_OBJECTIVE_SUMMARY,
  calculateSuggestedGoals,
} from '../../core/utils/goals-calculator';
import { FitnessObjective, MacroGoals, UserWeight } from '../../models';
import { NutritionService } from '../../services/nutrition.service';
import { UserService } from '../../services/user.service';

@Component({
  selector: 'app-edit-goals',
  templateUrl: './edit-goals.page.html',
  styleUrls: ['./edit-goals.page.scss'],
  imports: [FormsModule, DecimalPipe, IonContent, IonInput, IonIcon],
})
export class EditGoalsPage implements OnInit {
  private readonly location = inject(Location);
  private readonly userService = inject(UserService);
  private readonly nutritionService = inject(NutritionService);

  readonly objectiveOptions = FITNESS_OBJECTIVE_OPTIONS;
  readonly objectiveLabels = FITNESS_OBJECTIVE_LABELS;

  currentWeight = 72;
  targetWeight = 68;
  objective: FitnessObjective = 'lose';
  goals: MacroGoals = { calories: 0, protein: 0, carbs: 0, fat: 0, sugar: 0, waterMl: 0 };
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
    });
  }

  ngOnInit(): void {
    const user = this.userService.getUser();
    this.loadFromUser(user.weight, user.fitnessObjective, user.goals);
  }

  get objectiveSummary(): string {
    return FITNESS_OBJECTIVE_SUMMARY[this.objective];
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

  private loadFromUser(weight: UserWeight, objective: FitnessObjective, goals: MacroGoals): void {
    this.currentWeight = weight.current;
    this.targetWeight = weight.goal;
    this.objective = objective;
    this.goals = { ...goals };
  }

  private applySuggestedGoals(): void {
    this.goals = calculateSuggestedGoals({
      currentWeight: this.currentWeight,
      objective: this.objective,
    });
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

    const weight: UserWeight = {
      ...this.userService.getUser().weight,
      current: this.currentWeight,
      goal: this.targetWeight,
    };

    try {
      await this.userService.updateGoalsProfile({
        goals: { ...this.goals },
        weight,
        fitnessObjective: this.objective,
      });
      await this.nutritionService.refreshToday();
      this.goBack();
    } finally {
      this.isSaving = false;
    }
  }
}
