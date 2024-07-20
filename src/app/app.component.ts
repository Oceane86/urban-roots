import { Component, inject, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';
import { AuthService } from './services/auth.service';
import { LoadingComponent } from './loading/loading.component';
import { Router } from '@angular/router';
import { filter } from 'rxjs/operators';
import { NavigationEnd } from '@angular/router';




@Component({
  selector: 'app-root',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink, LoadingComponent],
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.css']
})
export class AppComponent implements OnInit {
  authService = inject(AuthService);

  loading = true;

  constructor(private router: Router) {}



  ngOnInit(): void {
    setTimeout(() => {
      this.loading = false; // Simule la fin du chargement après 3 secondes
    }, 3000);
  }

  logout(): void {
    this.authService.logout();
  }
}
