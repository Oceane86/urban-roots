
// src/app/pages/profile/profile.component.ts
import { Component, OnInit, inject } from '@angular/core';
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
  }

  logout(): void {
    this.authService.logout();
    this.router.navigate(['']);
  }
}
