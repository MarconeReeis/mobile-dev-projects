import { Component, computed, inject, signal } from '@angular/core';
import { Router } from '@angular/router';
import { DecimalPipe } from '@angular/common';
import { IonContent, IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { chevronBackOutline, chevronForwardOutline, flagOutline, statsChartOutline } from 'ionicons/icons';
import {
  addMonths,
  buildCalendarDays,
  formatMonthYear,
  getCalendarHeaders,
} from '../../core/utils/calendar.utils';
import { toDateKey } from '../../core/utils/date.utils';
import { CalendarDay, DayHistoryDetail, DayStatus } from '../../models';
import { NutritionService } from '../../services/nutrition.service';
import { EmptyStateComponent } from '../../shared/components/empty-state/empty-state.component';
import { MonthTrendChartComponent } from '../../shared/components/month-trend-chart/month-trend-chart.component';
import { WeekChartComponent } from '../../shared/components/week-chart/week-chart.component';

@Component({
  selector: 'app-history',
  templateUrl: './history.page.html',
  styleUrls: ['./history.page.scss'],
  imports: [DecimalPipe, IonContent, IonIcon, WeekChartComponent, MonthTrendChartComponent, EmptyStateComponent],
})
export class HistoryPage {
  private readonly router = inject(Router);
  private readonly nutritionService = inject(NutritionService);

  readonly calendarHeaders = getCalendarHeaders();
  readonly todayKey = toDateKey();

  readonly selectedDateKey = signal(this.todayKey);
  readonly viewYear = signal(new Date().getFullYear());
  readonly viewMonth = signal(new Date().getMonth());

  readonly monthLabel = computed(() =>
    formatMonthYear(new Date(this.viewYear(), this.viewMonth(), 1)),
  );

  readonly calendarDays = computed(() => {
    const statusMap = this.nutritionService.getStatusMapForMonth(
      this.viewYear(),
      this.viewMonth(),
    );

    return buildCalendarDays(
      this.viewYear(),
      this.viewMonth(),
      this.todayKey,
      statusMap,
    );
  });

  readonly selectedDay = computed<DayHistoryDetail>(() =>
    this.nutritionService.getDayDetail(this.selectedDateKey()),
  );

  readonly weekBars = computed(() =>
    this.nutritionService.getWeekBars(this.selectedDateKey()),
  );

  readonly monthTrend = computed(() =>
    this.nutritionService.getMonthTrend(this.viewYear(), this.viewMonth()),
  );

  readonly calorieGoal = computed(() => this.nutritionService.getCalorieGoal());

  readonly hasAnyLogs = computed(() => this.nutritionService.hasAnyLogs());

  constructor() {
    addIcons({ chevronBackOutline, chevronForwardOutline, flagOutline, statsChartOutline });
  }

  isSelected(day: CalendarDay): boolean {
    return day.dateKey === this.selectedDateKey();
  }

  selectDay(day: CalendarDay): void {
    if (!day.isCurrentMonth) {
      return;
    }

    this.selectedDateKey.set(day.dateKey);
  }

  previousMonth(): void {
    const next = addMonths(this.viewYear(), this.viewMonth(), -1);
    this.viewYear.set(next.year);
    this.viewMonth.set(next.month);
  }

  nextMonth(): void {
    const next = addMonths(this.viewYear(), this.viewMonth(), 1);
    this.viewYear.set(next.year);
    this.viewMonth.set(next.month);
  }

  statusClass(status: DayStatus): string {
    return status === 'none' ? '' : `status-${status}`;
  }

  onAdjustGoals(): void {
    void this.router.navigate(['/tabs/profile/goals']);
  }

  onAddMeal(): void {
    void this.router.navigate(['/tabs/meals/add']);
  }
}
