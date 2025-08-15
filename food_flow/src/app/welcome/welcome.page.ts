import { Component } from '@angular/core';
import { IonicModule } from '@ionic/angular';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';

@Component({
  selector: 'app-welcome',
  templateUrl: './welcome.page.html',
  styleUrls: ['./welcome.page.scss'],
  standalone: true,
  imports: [IonicModule, CommonModule]
})
export class WelcomePage {

  constructor(private router: Router) {}

  onLogin() {
    console.log('Botão Entrar clicado');
    // TODO: Implementar navegação para tela de login
    // this.router.navigate(['/login']);
  }

  onRegister() {
    console.log('Botão Cadastrar clicado');
    // TODO: Implementar navegação para tela de cadastro
    // this.router.navigate(['/register']);
  }

  onGuestLogin() {
    console.log('Botão Entrar como convidado clicado');
    // Navega para a tela home como convidado
    this.router.navigate(['/home']);
  }

  onTermsClick(event: Event) {
    event.preventDefault();
    console.log('Termos de Uso clicado');
    // TODO: Implementar navegação para tela de termos de uso
    // this.router.navigate(['/terms']);
  }
}
