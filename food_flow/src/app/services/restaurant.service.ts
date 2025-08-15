import { Injectable } from '@angular/core';
import { Observable, of } from 'rxjs';
import { Restaurant, Category, MenuItem } from '../models';

@Injectable({
  providedIn: 'root'
})
export class RestaurantService {
  private restaurants: Restaurant[] = [
    {
      id: '1',
      name: 'Pizzaria Bella Vista',
      cuisine: 'Italiana • Pizza',
      description: 'As melhores pizzas da cidade com ingredientes frescos e receitas tradicionais italianas.',
      rating: 4.8,
      reviewCount: 1250,
      deliveryTime: '25-35 min',
      deliveryFee: 3.99,
      minimumOrder: 20,
      image: 'assets/images/pizza.jpg',
      isOpen: true,
      categories: [
        { id: '1', name: 'Pizza', icon: 'pizza', color: 'bg-red-100 text-red-600' },
        { id: '2', name: 'Italiana', icon: 'restaurant', color: 'bg-orange-100 text-orange-600' }
      ],
      menu: [
        {
          id: '1',
          name: 'Margherita',
          description: 'Molho de tomate, mussarela, manjericão fresco',
          price: 28.90,
          image: 'assets/images/pizza.jpg',
          categoryId: '1',
          isAvailable: true
        },
        {
          id: '2',
          name: 'Pepperoni',
          description: 'Molho de tomate, mussarela, pepperoni',
          price: 32.90,
          image: 'assets/images/pizza.jpg',
          categoryId: '1',
          isAvailable: true
        }
      ],
      discount: { percentage: 30, description: '30% OFF' }
    },
    {
      id: '2',
      name: 'Sushi Master',
      cuisine: 'Japonesa • Sushi',
      description: 'Sushi fresco e autêntico preparado por chefs especializados.',
      rating: 4.9,
      reviewCount: 890,
      deliveryTime: '30-45 min',
      deliveryFee: 5.99,
      minimumOrder: 25,
      image: 'assets/images/sushi.jpg',
      isOpen: true,
      categories: [
        { id: '3', name: 'Japonesa', icon: 'fish', color: 'bg-pink-100 text-pink-600' },
        { id: '4', name: 'Sushi', icon: 'restaurant', color: 'bg-blue-100 text-blue-600' }
      ],
      menu: [
        {
          id: '3',
          name: 'Combo Sushi',
          description: '12 peças de sushi variado com wasabi e gengibre',
          price: 45.90,
          image: 'assets/images/sushi.jpg',
          categoryId: '3',
          isAvailable: true
        }
      ],
      isNew: true
    },
    {
      id: '3',
      name: 'Taco Loco',
      cuisine: 'Mexicana • Tacos',
      description: 'Tacos autênticos mexicanos com sabores tradicionais.',
      rating: 4.7,
      reviewCount: 650,
      deliveryTime: '20-30 min',
      deliveryFee: 2.99,
      minimumOrder: 15,
      image: 'assets/images/tacos.jpg',
      isOpen: true,
      categories: [
        { id: '5', name: 'Mexicana', icon: 'restaurant', color: 'bg-orange-100 text-orange-600' }
      ],
      menu: [
        {
          id: '4',
          name: 'Taco de Carne',
          description: 'Tortilla de milho, carne assada, cebola, coentro',
          price: 8.90,
          image: 'assets/images/tacos.jpg',
          categoryId: '5',
          isAvailable: true
        }
      ],
      discount: { percentage: 25, description: '25% OFF' }
    },
    {
      id: '4',
      name: 'Burger Station',
      cuisine: 'Americana • Hambúrguer',
      description: 'Hambúrgueres gourmet com pães artesanais e ingredientes premium.',
      rating: 4.6,
      reviewCount: 1100,
      deliveryTime: '15-25 min',
      deliveryFee: 0,
      minimumOrder: 18,
      image: 'assets/images/hero-burger.jpg',
      isOpen: true,
      categories: [
        { id: '2', name: 'Hambúrguer', icon: 'restaurant', color: 'bg-orange-100 text-orange-600' }
      ],
      menu: [
        {
          id: '5',
          name: 'Classic Burger',
          description: 'Pão brioche, hambúrguer 180g, alface, tomate, cebola',
          price: 22.90,
          image: 'assets/images/hero-burger.jpg',
          categoryId: '2',
          isAvailable: true
        }
      ]
    },
    {
      id: '5',
      name: 'Green Bowl',
      cuisine: 'Saudável • Saladas',
      description: 'Comida saudável e saborosa para quem busca uma alimentação equilibrada.',
      rating: 4.8,
      reviewCount: 420,
      deliveryTime: '20-30 min',
      deliveryFee: 4.99,
      minimumOrder: 22,
      image: 'assets/images/sushi.jpg',
      isOpen: true,
      categories: [
        { id: '6', name: 'Saudável', icon: 'leaf', color: 'bg-green-100 text-green-600' }
      ],
      menu: [
        {
          id: '6',
          name: 'Bowl de Quinoa',
          description: 'Quinoa, abacate, tomate cereja, pepino, molho tahine',
          price: 28.90,
          image: 'assets/images/sushi.jpg',
          categoryId: '6',
          isAvailable: true
        }
      ],
      isNew: true
    },
    {
      id: '6',
      name: 'Café Central',
      cuisine: 'Café • Lanches',
      description: 'Café e lanches rápidos para qualquer momento do dia.',
      rating: 4.5,
      reviewCount: 780,
      deliveryTime: '10-20 min',
      deliveryFee: 2.99,
      minimumOrder: 12,
      image: 'assets/images/tacos.jpg',
      isOpen: true,
      categories: [
        { id: '4', name: 'Bebidas', icon: 'cafe', color: 'bg-blue-100 text-blue-600' }
      ],
      menu: [
        {
          id: '7',
          name: 'Cappuccino',
          description: 'Café expresso, leite vaporizado, espuma de leite',
          price: 8.90,
          image: 'assets/images/tacos.jpg',
          categoryId: '4',
          isAvailable: true
        }
      ]
    }
  ];

  private categories: Category[] = [
    { id: '1', name: 'Pizza', icon: 'pizza', color: 'bg-red-100 text-red-600' },
    { id: '2', name: 'Hambúrguer', icon: 'restaurant', color: 'bg-orange-100 text-orange-600' },
    { id: '3', name: 'Japonesa', icon: 'fish', color: 'bg-pink-100 text-pink-600' },
    { id: '4', name: 'Bebidas', icon: 'cafe', color: 'bg-blue-100 text-blue-600' },
    { id: '5', name: 'Sobremesas', icon: 'ice-cream', color: 'bg-purple-100 text-purple-600' },
    { id: '6', name: 'Saudável', icon: 'leaf', color: 'bg-green-100 text-green-600' },
  ];

  constructor() { }

  getRestaurants(): Observable<Restaurant[]> {
    return of(this.restaurants);
  }

  getRestaurantById(id: string): Observable<Restaurant | undefined> {
    const restaurant = this.restaurants.find(r => r.id === id);
    return of(restaurant);
  }

  getCategories(): Observable<Category[]> {
    return of(this.categories);
  }

  getRestaurantsByCategory(categoryId: string): Observable<Restaurant[]> {
    const filtered = this.restaurants.filter(restaurant => 
      restaurant.categories.some(cat => cat.id === categoryId)
    );
    return of(filtered);
  }

  searchRestaurants(query: string): Observable<Restaurant[]> {
    const filtered = this.restaurants.filter(restaurant =>
      restaurant.name.toLowerCase().includes(query.toLowerCase()) ||
      restaurant.cuisine.toLowerCase().includes(query.toLowerCase())
    );
    return of(filtered);
  }

  getFeaturedRestaurants(): Observable<Restaurant[]> {
    const featured = this.restaurants.filter(restaurant => 
      restaurant.isFeatured || restaurant.discount || restaurant.isNew
    );
    return of(featured);
  }
}
