// src/app/pages/home/home.component.ts


import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { BottomBarComponent } from '../../components/bottom-bar/bottom-bar.component';
import { UrbanSpacesService } from '../../services/urban-spaces.service';

@Component({
  selector: 'app-home',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, BottomBarComponent],
  templateUrl: './home.component.html',
  styleUrls: ['./home.component.css']
})
export class HomeComponent implements OnInit {
  authService = inject(AuthService);
  user: any = null;
  urbanSpacesCount: number | null = null;

  constructor(private router: Router, private urbanSpacesService: UrbanSpacesService) {}

  ngOnInit(): void {
    const currentUser = this.authService.getCurrentUser();
    if (currentUser) {
      this.user = {
        email: currentUser.email,
        username: currentUser.displayName,
        // Ajoutez d'autres propriétés si nécessaire
      };
      console.log('User:', this.user); // Ajoutez cette ligne pour le débogage
    } else {
      console.log('No user logged in'); // Ajoutez cette ligne pour le débogage
    }

    // Récupérez les données des espaces urbains
    this.urbanSpacesService.getUrbanSpaces().subscribe(
      data => {
        console.log('API response:', data); // Ajoutez cette ligne pour le débogage
        if (data && data.length) {
          this.urbanSpacesCount = data.length;
        } else {
          this.urbanSpacesCount = 0; // Si aucune donnée ou sites n'est pas défini
        }
      },
      error => {
        console.error('Erreur lors de la récupération des espaces urbains', error);
        this.urbanSpacesCount = 0; // En cas d'erreur, définir à 0 ou une valeur par défaut appropriée
      }
    );
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }

  navigateToGuide(): void {
    this.router.navigate(['/quiz']);
  }

  navigateToForum(): void {
    this.router.navigate(['/forum']);
  }
}
