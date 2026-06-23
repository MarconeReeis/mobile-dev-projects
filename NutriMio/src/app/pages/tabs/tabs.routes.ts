import { Routes } from '@angular/router';

export const routes: Routes = [
  {
    path: 'tabs',
    loadComponent: () => import('./tabs.page').then((m) => m.TabsPage),
    children: [
      {
        path: 'dashboard',
        loadComponent: () =>
          import('../dashboard/dashboard.page').then((m) => m.DashboardPage),
      },
      {
        path: 'meals/foods/add',
        loadComponent: () => import('../add-food/add-food.page').then((m) => m.AddFoodPage),
      },
      {
        path: 'meals/foods',
        loadComponent: () => import('../foods/foods.page').then((m) => m.FoodsPage),
      },
      {
        path: 'meals/add',
        loadComponent: () => import('../add-meal/add-meal.page').then((m) => m.AddMealPage),
      },
      {
        path: 'meals',
        loadComponent: () => import('../meals/meals.page').then((m) => m.MealsPage),
      },
      {
        path: 'history',
        loadComponent: () => import('../history/history.page').then((m) => m.HistoryPage),
      },
      {
        path: 'profile/goals',
        loadComponent: () => import('../edit-goals/edit-goals.page').then((m) => m.EditGoalsPage),
      },
      {
        path: 'profile',
        loadComponent: () => import('../profile/profile.page').then((m) => m.ProfilePage),
      },
      {
        path: '',
        redirectTo: 'dashboard',
        pathMatch: 'full',
      },
    ],
  },
  {
    path: '',
    redirectTo: 'tabs/dashboard',
    pathMatch: 'full',
  },
];
