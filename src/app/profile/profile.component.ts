import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import { Router } from '@angular/router';
import { UserService } from '../services/user.service';
import { User } from '../models/user.model';

// @Component დეკორატორი განსაზღვრავს კომპონენტის მეტა-მონაცემებს
@Component({
  selector: 'app-profile', // HTML ელემენტის დასახელება, რომლითაც გამოიძახება კომპონენტი
  templateUrl: './profile.component.html', // HTML ტემპლეიტის მისამართი
  styleUrls: ['./profile.component.css'], // CSS სტილის ფაილის მისამართი
  standalone: true, // standalone კომპონენტის მიდგომა (Angular 14+)
  imports: [CommonModule], // საჭირო მოდულების იმპორტი
})
export class ProfileComponent implements OnInit {
  user: User | null = null; // მომხმარებლის მონაცემები, თავდაპირველად null

  constructor(
    private userService: UserService, // მომხმარებლის სერვისი
    private router: Router // გადამისამართების სერვისი
  ) {}

  // კომპონენტის ინიციალიზაციის დროს გამოძახებული მეთოდი
  ngOnInit(): void {
    // მომხმარებლის მიმდინარე მონაცემების მიღება სერვისიდან
    this.user = this.userService.currentUserValue;

    // დავლოგოთ მიღებული მონაცემები
    console.log('პროფილის მონაცემები:', this.user);

    // თუ მომხმარებელი ვერ მოიძებნა და არ არის ავტორიზებული, გადავამისამართოთ ავტორიზაციის გვერდზე
    if (!this.user || !this.userService.isLoggedIn()) {
      console.log(
        'მომხმარებელი არ არის ავტორიზებული, გადამისამართება ავტორიზაციის გვერდზე'
      );
      this.router.navigate(['/login']);
      return;
    }

    // თუ მომხმარებელის მონაცემები არასრულია, ვცადოთ მათი განახლება API-დან
    if (this.isMissingDetails()) {
      console.log('მომხმარებლის მონაცემები არასრულია, ვცდილობთ განახლებას...');
      this.refreshUserDetails();
    }
  }

  // მეთოდი, რომელიც ამოწმებს აქვს თუ არა მომხმარებელს სრული მონაცემები
  isMissingDetails(): boolean {
    if (!this.user) return true; // თუ მომხმარებელი null-ია, მაშინ მონაცემები ნამდვილად აკლია

    // შევამოწმოთ აკლია თუ არა რომელიმე მნიშვნელოვანი ველი
    return (
      !this.user.firstName ||
      !this.user.lastName ||
      !this.user.email ||
      !this.user.role
    );
  }

  // მომხმარებლის დეტალების განახლება API-დან
  refreshUserDetails(): void {
    this.userService.fetchUserDetails().subscribe({
      next: (updatedUser) => {
        console.log('მომხმარებლის მონაცემები განახლდა:', updatedUser);
        this.user = updatedUser; // კომპონენტის user ცვლადის განახლება
      },
      error: (err) => {
        console.error('მომხმარებლის მონაცემების განახლების შეცდომა:', err);
      },
    });
  }

  // შევამოწმოთ თუ გვაქვს კონკრეტული ველის მნიშვნელობა - გამოიყენება HTML-ში
  hasValue(field: string): boolean {
    return !!(this.user && (this.user as any)[field]); // !! გარდაქმნის ნებისმიერ მნიშვნელობას boolean ტიპად
  }

  // სისტემიდან გასვლა - გამოიძახება HTML-დან
  logout(): void {
    this.userService.logout(); // გამოვძახოთ სერვისის logout მეთოდი
    this.router.navigate(['/login']); // გადავამისამართოთ ავტორიზაციის გვერდზე
  }
}
