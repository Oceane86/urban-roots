// src/app/pages/join-us/join-us.component.ts


import { Component, inject } from '@angular/core';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { RouterLink, RouterOutlet } from '@angular/router';

@Component({
  selector: 'app-join-us',
  standalone: true,
  imports: [CommonModule, RouterOutlet, RouterLink],
  templateUrl: './join-us.component.html',
  styleUrls: ['./join-us.component.css']
})
export class JoinUsComponent {
  authService = inject(AuthService);
  termsAccepted = false; // Initial state of the terms checkbox
  showError = false; // Initial state of the error message
  errorMessage: string | null = null; // Property to store error messages

  constructor(private router: Router) {}

  ngOnInit(): void {
    this.authService.user$.subscribe(user => {
      if (user) {
        this.authService.currentUserSig.set({
          email: user.email!,
          username: user.displayName!,
        });
      } else {
        this.authService.currentUserSig.set(null);
      }
      console.log(this.authService.currentUserSig());
    });
  }

  // Method to toggle the termsAccepted property
  toggleTermsAccepted(event: Event) {
    this.termsAccepted = (event.target as HTMLInputElement).checked;
    if (this.termsAccepted) {
      this.showError = false;
      this.errorMessage = null;
    } else {
      this.showError = true;
      this.errorMessage = 'Veuillez accepter les conditions générales d\'utilisation.';
    }
    console.log(this.errorMessage);
  }

  // Method to handle Google sign-in
  async googleSignin() {
    if (!this.termsAccepted) {
      this.showError = true;
      this.errorMessage = 'Veuillez accepter les conditions générales d\'utilisation.';
      console.log(this.errorMessage);
      return;
    }
    try {
      await this.authService.signInWithGoogle();
      this.router.navigate(['/']); // Navigate to home or desired route
    } catch (error) {
      console.error('Error signing in with Google:', error);
    }
  }

  // Navigate to login screen
  nextScreen() {
    if (!this.termsAccepted) {
      this.showError = true;
      this.errorMessage = 'Veuillez accepter les conditions générales d\'utilisation.';
      console.log(this.errorMessage);
      return;
    }
    this.router.navigate(['/login']);
  }
}
