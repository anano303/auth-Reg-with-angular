import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { inject } from '@angular/core';

// ეს ფუნქცია ამოწმებს მომხმარებელი ავტორიზებულია თუ არა
export const AuthGuard: CanActivateFn = (route, state) => {
  const userService = inject(UserService);
  const router = inject(Router);

  // თუ მომხმარებელი ავტორიზებულია, დაშვება მისცეს გვერდზე
  if (userService.isLoggedIn()) {
    return true;
  }

  // წინააღმდეგ შემთხვევაში გადამისამართება მოხდეს ავტორიზაციის გვერდზე
  router.navigate(['/login']);
  return false;
};
