import { inject, Injectable, signal } from "@angular/core";
import { Auth, createUserWithEmailAndPassword, updateProfile, user } from "@angular/fire/auth";
import { signInWithEmailAndPassword } from "firebase/auth";
import { Observable, from } from "rxjs";
import { UserInterface } from "../user.interface";
import { GoogleAuthProvider, signInWithPopup } from "firebase/auth";

@Injectable({
  providedIn: "root",
})
export class AuthService {
  firebaseAuth = inject(Auth);
  user$ = user(this.firebaseAuth)
  currentUserSig = signal<UserInterface | null | undefined>(undefined)

  private logoutTimer: any;

  constructor() {
    this.setupActivityListeners();
  }

  register(email: string, username: string, password: string): Observable<void> {
    const promise = createUserWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(response => updateProfile(response.user, { displayName: username }));

    return from(promise);
  }

  login(email: string, password: string): Observable<void> {
    const promise = signInWithEmailAndPassword(
      this.firebaseAuth,
      email,
      password
    ).then(() => {
      this.resetLogoutTimer();
    });

    return from(promise);
  }

  logout(): Observable<void> {
    clearTimeout(this.logoutTimer);
    const promise = this.firebaseAuth.signOut();

    return from(promise);
  }

  getCurrentUser(): any {
    return this.firebaseAuth.currentUser;
  }


  signInWithGoogle(): Promise<void> {
    const provider = new GoogleAuthProvider();
    return signInWithPopup(this.firebaseAuth, provider)
      .then((result) => {
        if (result.user) {
          updateProfile(result.user, {
            displayName: result.user.displayName,
            photoURL: result.user.photoURL,
          });
        }
      });
  }



  private setupActivityListeners(): void {
    const events = ['mousemove', 'keydown', 'click'];
    events.forEach(event => {
      window.addEventListener(event, () => this.resetLogoutTimer());
    });
  }

  private resetLogoutTimer(): void {
    if (this.logoutTimer) {
      clearTimeout(this.logoutTimer);
    }
    this.logoutTimer = setTimeout(() => {
      this.logout().subscribe();
    }, 20 * 60 * 1000); // 20 minutes in milliseconds
  }
}
