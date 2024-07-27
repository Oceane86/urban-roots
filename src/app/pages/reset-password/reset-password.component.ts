// src/app/reset-password/reset-password.component.ts
import { Component } from '@angular/core';
import { FormsModule } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';

@Component({
  selector: 'app-reset-password',
  templateUrl: './reset-password.component.html',
  standalone: true,
  imports: [FormsModule, CommonModule],
})
export class ResetPasswordComponent {
  resetEmail: string = '';
  errorMessage: string | null = null;

  constructor(private authService: AuthService, private router: Router) {}

  onResetPassword(): void {
    if (this.resetEmail) {
      this.authService.sendPasswordResetEmail(this.resetEmail)
        .subscribe({
          next: () => {
            alert('Un email de réinitialisation de mot de passe a été envoyé.');
            this.router.navigateByUrl('/login'); // Redirige vers la page de connexion après la réinitialisation
          },
          error: (err) => {
            console.log('Error:', err);  // Ajoutez cette ligne pour inspecter l'erreur
            if (err.code === 'auth/user-not-found') {
              this.errorMessage = 'Aucun utilisateur trouvé avec cet email. Vous allez être redirigé vers la page d\'inscription.';
              setTimeout(() => {
                this.router.navigateByUrl('/register'); // Redirige vers la page d'inscription
              }, 3000); // Redirection après 3 secondes pour permettre à l'utilisateur de lire le message
            } else {
              this.errorMessage = err.message;
            }
          }
        });
    } else {
      alert('Veuillez entrer votre adresse email.');
    }
  }
}
