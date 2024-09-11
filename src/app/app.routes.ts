import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LoginComponent } from './pages/login/login.component'; // Assuming it's LoginComponent
import { WelcomeScreenComponent } from './pages/welcome-screen/welcome-screen.component';
import { JoinUsComponent } from './pages/join-us/join-us.component';
import { HomeComponent } from './pages/home/home.component';
import { Profile } from './pages/profile/profile.component'; // Correct the import
import { InteractiveGuideComponent } from './pages/interactive-guide/interactive-guide.component';
import { QuizComponent } from './pages/quiz/quiz.component';
import { ForumComponent } from './pages/forum/forum.component';
import { MapComponent } from './components/map/map.component';
import { ReplyPageComponent } from './pages/reply/reply.component';
import { ResetPasswordComponent } from './pages/reset-password/reset-password.component';
import { TermsComponent } from './pages/terms/terms.component';


export const routes: Routes = [
  { path: '', component: WelcomeScreenComponent },
  { path: 'join-us', component: JoinUsComponent },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: Profile},
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'reset-password', component: ResetPasswordComponent},
  { path: 'guide-interactif', component: InteractiveGuideComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'reply/:id', component: ReplyPageComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'carte', component: MapComponent },
  { path: 'terms', component: TermsComponent },
  { path: '**', redirectTo: '/join-us' }

];
