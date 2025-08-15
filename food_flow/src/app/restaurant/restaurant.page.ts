import { Component, OnInit } from '@angular/core';
import { ActivatedRoute } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Restaurant } from '../models';
import { RestaurantService } from '../services/restaurant.service';

@Component({
  selector: 'app-restaurant',
  templateUrl: './restaurant.page.html',
  styleUrls: ['./restaurant.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class RestaurantPage implements OnInit {
  restaurant: Restaurant | undefined;
  loading: boolean = true;

  constructor(
    private route: ActivatedRoute,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit() {
    this.loadRestaurant();
  }

  loadRestaurant() {
    const restaurantId = this.route.snapshot.paramMap.get('id');
    if (restaurantId) {
      this.restaurantService.getRestaurantById(restaurantId).subscribe(restaurant => {
        this.restaurant = restaurant;
        this.loading = false;
      });
    }
  }
}
