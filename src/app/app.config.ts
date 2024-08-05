// src/app/app.config.ts


import { ApplicationConfig } from '@angular/core';
import { provideRouter } from '@angular/router';
import { provideFirebaseApp, initializeApp } from '@angular/fire/app';
import { routes } from './app.routes';
import { provideHttpClient } from '@angular/common/http';
import { provideAuth, getAuth } from '@angular/fire/auth';
import { provideFirestore, getFirestore } from '@angular/fire/firestore'; // Add these imports

const firebaseConfig = {
  apiKey: "AIzaSyDHWbUV57501LNpr-ebTmIJsLzDJj1u2qU",
  authDomain: "angular-429221.firebaseapp.com",
  databaseURL: "https://angular-429221-default-rtdb.firebaseio.com",
  projectId: "angular-429221",
  storageBucket: "angular-429221.appspot.com",
  messagingSenderId: "54770817601",
  appId: "1:54770817601:web:64afe9dd43c7aa527144c0"
};

export const appConfig: ApplicationConfig = {
  providers: [
    provideRouter(routes),
    provideHttpClient(),
    provideFirebaseApp(() => initializeApp(firebaseConfig)),
    provideAuth(() => getAuth()),
    provideFirestore(() => getFirestore()) 
  ],
};
