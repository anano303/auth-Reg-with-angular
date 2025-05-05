import { Injectable } from '@angular/core';
import { CanActivateFn, Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { inject } from '@angular/core';

// ეს ფუნქცია ამოწმებს მომხმარებელი ავტორიზებულია თუ არა
// CanActivateFn არის ფუნქციური მიდგომა Angular-ის მარშრუტების დაცვისთვის
export const AuthGuard: CanActivateFn = (route, state) => {
  // inject ფუნქცია საშუალებას გვაძლევს ფუნქციის შიგნით მივიღოთ სერვისები
  const userService = inject(UserService); // მომხმარებლის სერვისი ავტორიზაციის შესამოწმებლად
  const router = inject(Router); // Router სერვისი გადამისამართებისთვის

  // თუ მომხმარებელი ავტორიზებულია, დაშვება მისცეს გვერდზე
  if (userService.isLoggedIn()) {
    return true; // მარშრუტის გააქტიურება დაშვებულია
  }

  // წინააღმდეგ შემთხვევაში გადამისამართება მოხდეს ავტორიზაციის გვერდზე
  router.navigate(['/login']); // არაავტორიზებული მომხმარებელი გადამისამართდება ავტორიზაციის გვერდზე
  return false; // მარშრუტის გააქტიურება უარყოფილია
};
