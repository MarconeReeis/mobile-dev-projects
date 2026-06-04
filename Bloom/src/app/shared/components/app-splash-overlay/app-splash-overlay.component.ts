import { Component, input } from '@angular/core';

@Component({
  selector: 'app-splash-overlay',
  templateUrl: './app-splash-overlay.component.html',
  styleUrls: ['./app-splash-overlay.component.scss'],
})
export class AppSplashOverlayComponent {
  readonly exiting = input(false);
}
