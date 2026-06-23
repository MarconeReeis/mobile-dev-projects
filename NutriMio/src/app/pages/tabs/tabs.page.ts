import { Component } from '@angular/core';
import { IonIcon, IonLabel, IonTabBar, IonTabButton, IonTabs } from '@ionic/angular/standalone';
import { addIcons } from 'ionicons';
import {
  barChart,
  barChartOutline,
  home,
  homeOutline,
  person,
  personOutline,
  restaurant,
  restaurantOutline,
} from 'ionicons/icons';

@Component({
  selector: 'app-tabs',
  templateUrl: './tabs.page.html',
  styleUrls: ['./tabs.page.scss'],
  imports: [IonTabs, IonTabBar, IonTabButton, IonIcon, IonLabel],
})
export class TabsPage {
  constructor() {
    addIcons({
      home,
      homeOutline,
      restaurant,
      restaurantOutline,
      barChart,
      barChartOutline,
      person,
      personOutline,
    });
  }
}
