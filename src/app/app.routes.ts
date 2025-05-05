import { Routes } from '@angular/router';
import { HomeComponent } from './home/home.component';

import { AuthGuard } from './guards/auth.guard';
import { LoginComponent } from './auth/login/login.component';
import { RegisterComponent } from './auth/register/register.component';
import { ProfileComponent } from './profile/profile.component';

export const routes: Routes = [
  { path: '', redirectTo: 'home', pathMatch: 'full' }, // გვერდის გახსნისას გადამისამართება home გვერდზე
  { path: 'home', component: HomeComponent }, // მთავარი გვერდი
  { path: 'login', component: LoginComponent }, // ავტორიზაციის გვერდი
  { path: 'register', component: RegisterComponent }, // რეგისტრაციის გვერდი
  {
    path: 'profile',
    component: ProfileComponent,
    canActivate: [AuthGuard], // დაცული გვერდი - მხოლოდ ავტორიზებული მომხმარებლისთვის
  },
  { path: '**', redirectTo: 'home' }, // თუ გვერდი არ არსებობს, გადამისამართება მოხდება მთავარ გვერდზე
];
