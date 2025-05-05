import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

@Component({
  selector: 'app-profile',
  templateUrl: './profile.component.html',
  styleUrls: ['./profile.component.css'],
  standalone: true,
  imports: [CommonModule],
})
export class ProfileComponent implements OnInit {
  user: User | null = null; // მომხმარებლის მონაცემები

  constructor(
    private userService: UserService, // მომხმარებლის სერვისი
    private router: Router // გადამისამართებისთვის
  ) {}

  ngOnInit(): void {
    // მომხმარებლის მონაცემების მიღება
    this.user = this.userService.currentUserValue;

    // დავლოგოთ მიღებული მონაცემები
    console.log('პროფილის მონაცემები:', this.user);

    // თუ მომხმარებელი ვერ მოიძებნა და არ არის ავტორიზებული
    if (!this.user || !this.userService.isLoggedIn()) {
      console.log(
        'მომხმარებელი არ არის ავტორიზებული, გადამისამართება ავტორიზაციის გვერდზე'
      );
      this.router.navigate(['/login']);
      return;
    }

    // თუ მომხმარებელის მონაცემები არასრულია, ვცადოთ განახლება
    if (this.isMissingDetails()) {
      console.log('მომხმარებლის მონაცემები არასრულია, ვცდილობთ განახლებას...');
      this.refreshUserDetails();
    }
  }

  // შემოწმება აქვს თუ არა მომხმარებელს სრული მონაცემები
  isMissingDetails(): boolean {
    if (!this.user) return true;

    // შევამოწმოთ აკლია თუ არა რომელიმე მნიშვნელოვანი ველი
    return (
      !this.user.firstName ||
      !this.user.lastName ||
      !this.user.email ||
      !this.user.role
    );
  }

  // მომხმარებლის დეტალების განახლება
  refreshUserDetails(): void {
    this.userService.fetchUserDetails().subscribe({
      next: (updatedUser) => {
        console.log('მომხმარებლის მონაცემები განახლდა:', updatedUser);
        this.user = updatedUser;
      },
      error: (err) => {
        console.error('მომხმარებლის მონაცემების განახლების შეცდომა:', err);
      },
    });
  }

  // შევამოწმოთ თუ გვაქვს კონკრეტული ველის მნიშვნელობა
  hasValue(field: string): boolean {
    return !!(this.user && (this.user as any)[field]);
  }

  // სისტემიდან გასვლა
  logout(): void {
    this.userService.logout();
    this.router.navigate(['/login']);
  }
}
