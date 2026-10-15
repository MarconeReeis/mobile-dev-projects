import { Routes } from '@angular/router';
import { guestGuard } from './core/guards/auth.guard';

export const routes: Routes = [
  {
    path: 'login',
    canActivate: [guestGuard],
    loadComponent: () => import('./pages/login/login.page').then((m) => m.LoginPage),
  },
  {
    path: '',
    loadChildren: () => import('./pages/tabs/tabs.routes').then((m) => m.routes),
  },
];
