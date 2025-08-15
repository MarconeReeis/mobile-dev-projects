import { Component, OnInit } from '@angular/core';
import { Router } from '@angular/router';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { FormsModule } from '@angular/forms';
import { Restaurant, Category } from '../models';
import { RestaurantService } from '../services/restaurant.service';

@Component({
  selector: 'app-home',
  templateUrl: './home.page.html',
  styleUrls: ['./home.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule, FormsModule]
})
export class HomePage implements OnInit {
  categories: Category[] = [];
  featuredRestaurants: Restaurant[] = [];
  searchQuery: string = '';
  userAddress: string = 'Rua das Flores, 123 - Centro';
  loading: boolean = true;

  constructor(
    private router: Router,
    private restaurantService: RestaurantService
  ) {}

  ngOnInit() {
    this.loadData();
  }

  async loadData() {
    try {
      this.loading = true;
      
      // Carregar categorias
      this.restaurantService.getCategories().subscribe(categories => {
        this.categories = categories;
      });

      // Carregar restaurantes em destaque
      this.restaurantService.getFeaturedRestaurants().subscribe(restaurants => {
        this.featuredRestaurants = restaurants;
        this.loading = false;
      });
    } catch (error) {
      console.error('Erro ao carregar dados:', error);
      this.loading = false;
    }
  }

  onSearchChange(event: any) {
    this.searchQuery = event.detail.value;
    this.performSearch();
  }

  performSearch() {
    if (this.searchQuery.trim()) {
      this.restaurantService.searchRestaurants(this.searchQuery).subscribe(restaurants => {
        this.featuredRestaurants = restaurants;
      });
    } else {
      this.loadData();
    }
  }

  onCategoryClick(category: Category) {
    console.log('Categoria selecionada:', category);
    this.restaurantService.getRestaurantsByCategory(category.id).subscribe(restaurants => {
      this.featuredRestaurants = restaurants;
    });
  }

  onRestaurantClick(restaurant: Restaurant) {
    this.router.navigate(['/restaurant', restaurant.id]);
  }

  onOrderNow() {
    // Implementar ação do botão "Pedir Agora"
    console.log('Pedir agora clicado');
  }

  onProfileClick() {
    this.router.navigate(['/profile']);
  }

  onCartClick() {
    this.router.navigate(['/cart']);
  }

  formatDeliveryFee(fee: number): string {
    return fee === 0 ? 'Grátis' : `R$ ${fee.toFixed(2).replace('.', ',')}`;
  }
}
