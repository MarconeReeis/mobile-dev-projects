import { Component } from '@angular/core';
import { StatusBar, Style } from '@capacitor/status-bar';

@Component({
  selector: 'app-root',
  templateUrl: 'app.component.html',
  styleUrls: ['app.component.scss'],
  standalone: false,
})
export class AppComponent {
  constructor() {
    this.initializeApp();
  }

  async initializeApp() {
    // Força o tema claro
    document.documentElement.setAttribute('data-theme', 'light');
    document.body.classList.remove('dark');
    document.body.classList.add('light');
    
    // Configura a status bar para tema claro
    try {
      await StatusBar.setStyle({ style: Style.Light });
      await StatusBar.setBackgroundColor({ color: '#ffffff' });
    } catch (error) {
      console.log('StatusBar not available');
    }
  }
}
