import { Component, inject } from '@angular/core';
import { IonIcon } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import { moonOutline, sunnyOutline } from 'ionicons/icons';
import { ThemeService } from '../../../core/services/theme.service';

addIcons({ moonOutline, sunnyOutline });

@Component({
  selector: 'app-theme-toggle',
  templateUrl: './theme-toggle.component.html',
  styleUrls: ['./theme-toggle.component.scss'],
  imports: [IonIcon],
})
export class ThemeToggleComponent {
  readonly themeService = inject(ThemeService);
}
