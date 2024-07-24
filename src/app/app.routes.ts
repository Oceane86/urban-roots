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
import { ReplyPageComponent } from './pages/reply/reply.component';
import { TestComponent } from './components/test/test.component';


export const routes: Routes = [
  { path: '', component: WelcomeScreenComponent },
  { path: 'join-us', component: JoinUsComponent },
  { path: 'home', component: HomeComponent },
  { path: 'profile', component: Profile},
  { path: 'register', component: RegisterComponent },
  { path: 'login', component: LoginComponent },
  { path: 'guide-interactif', component: InteractiveGuideComponent },
  { path: 'quiz', component: QuizComponent },
  { path: 'replyId', component: ReplyPageComponent },
  { path: 'forum', component: ForumComponent },
  { path: 'carte4', component: TestComponent }
];
