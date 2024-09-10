// src/app/pages/register/register.component.ts


import { HttpClient } from '@angular/common/http';
import { Component, inject } from '@angular/core';
import { FormBuilder, ReactiveFormsModule, Validators } from '@angular/forms';
import { Router } from '@angular/router';
import { AuthService } from '../../services/auth.service';
import { CommonModule } from '@angular/common';
import { passwordValidator } from '../../validator/password-validator/password-validator.ts.component';
@Component({
  selector: 'app-register',
  templateUrl: './register.component.html',
  standalone: true,
  imports: [ReactiveFormsModule, CommonModule],
})
export class RegisterComponent {
  fb = inject(FormBuilder);
  http = inject(HttpClient);
  authService = inject(AuthService);
  router = inject(Router);

  form = this.fb.nonNullable.group({
    username: ['', [Validators.required, Validators.minLength(3)]],
    email: ['', [Validators.required, Validators.email]],
    password: ['', [Validators.required, Validators.minLength(6), passwordValidator()]],
  });

  errorMessage: string | null = null;

  onSubmit(): void {
    if (this.form.valid) {
      const rawForm = this.form.getRawValue();
      console.log('Form is valid, attempting to register:', rawForm);

      this.authService.register(rawForm.email, rawForm.username, rawForm.password).subscribe({
        next: () => {
          console.log('Registration successful, navigating to home.');
          this.router.navigateByUrl('/home'); // Redirige vers la page d'accueil après l'inscription
        },
        error: (err) => {
          console.error('Error during registration:', err);
          if (err.code === 'auth/email-already-in-use') {
            this.errorMessage = 'L\'email existe déjà dans la base de données.';
          } else if (err.code === 'auth/invalid-email') {
            this.errorMessage = 'L\'email n\'est pas au bon format.';
          } else if (err.code === 'auth/weak-password') {
            this.errorMessage = 'Le mot de passe est trop court.';
          } else {
            this.errorMessage = 'Erreur: ' + err.message; // Affiche l'erreur pour l'utilisateur
          }
        }
      });
    } else {
      console.log('Form is invalid:', this.form);
      this.errorMessage = 'Veuillez remplir correctement tous les champs.';
    }
  }
}
