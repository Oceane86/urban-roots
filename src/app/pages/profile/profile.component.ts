import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { BottomBarComponent } from '../../components/bottom-bar/bottom-bar.component';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';

@Component({
  selector: 'app-profile',
  standalone: true,
  imports: [CommonModule, BottomBarComponent],
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css']
})
export class Profile implements OnInit {
  authService = inject(AuthService);
  user: any = null;
  bioText: string = '';

  constructor(private router: Router) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = {
        email: currentUser.email,
        username: currentUser.displayName,
        // Ajoutez d'autres propriétés si nécessaire
      };
    }
    this.setDailyQuote();
  }

  setDailyQuote(): void {
    const quotes = [
      "Le jardinage est une façon de se reconnecter avec la nature.",
      "Chaque plante est une œuvre d'art qui grandit avec amour.",
      "Le jardin est le lieu où la patience se transforme en beauté.",
      "Les fleurs sont les sourires de la terre.",
      "Cultivez des rêves comme vous cultivez des plantes.",
      "La nature est le meilleur des thérapeutes."
    ];

    const today = new Date();
    const startOfYear = new Date(today.getFullYear(), 0, 0);
    const diff = today.getTime() - startOfYear.getTime();
    const oneDay = 1000 * 60 * 60 * 24;
    const dayOfYear = Math.floor(diff / oneDay);
    const quoteIndex = dayOfYear % quotes.length;
    this.bioText = quotes[quoteIndex];
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['/login']); 
  }
}
