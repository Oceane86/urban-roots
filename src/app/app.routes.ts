import { Routes } from '@angular/router';
import { RegisterComponent } from './pages/register/register.component';
import { LogicComponent } from './pages/login/login.component';
import { WelcomeScreenComponent } from './pages/welcome-screen/welcome-screen.component';
import { JoinUsComponent } from './pages/join-us/join-us.component';
import { HomeComponent } from './pages/home/home.component';
import { Profile} from '../app/pages/profile/profile.component';
import { InteractiveGuideComponent } from './pages/interactive-guide/interactive-guide.component';

import { LeafletMapComponent} from '../app/components/leaflet-map/leaflet-map.component';
import { QuizComponent } from './pages/quiz/quiz.component';


export const routes: Routes = [
  { path: '', component: WelcomeScreenComponent },
  { path: 'join-us', component: JoinUsComponent },
  { path: 'home', component: HomeComponent  },
  { path: 'profile', component: Profile },

  { path: 'map', component: LeafletMapComponent },
  {
    path: 'register',
    component: RegisterComponent,
  },
  {
    path: 'login',
    component: LogicComponent,
  },
  { path: 'guide-interactif', component: InteractiveGuideComponent },
  { path: 'quiz', component: QuizComponent },


];
