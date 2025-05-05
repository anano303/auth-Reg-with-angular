import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

@Component({
  selector: 'app-header',
  templateUrl: './header.component.html',
  styleUrls: ['./header.component.css'],
  standalone: true,
  imports: [CommonModule, RouterLink],
})
export class HeaderComponent implements OnInit {
  userName: string = 'მომხმარებელი'; // საწყისი სახელი

  constructor(
    public userService: UserService // მომხმარებლის სერვისი
  ) {}

  ngOnInit(): void {
    // მოვუსმინოთ მომხმარებლის ცვლილებებს რომ სახელი განახლდეს ავტომატურად
    this.userService.currentUser.subscribe((user) => {
      if (user && user.firstName && user.lastName) {
        this.userName = `${user.firstName} ${user.lastName}`;
      } else if (user && user.firstName) {
        this.userName = user.firstName;
      } else if (user && user.phoneNumber) {
        this.userName = user.phoneNumber;
      } else {
        this.userName = 'მომხმარებელი';
      }
    });
  }

  // შევამოწმოთ თუ შესაძლებელია სახელის გამოტანა
  getUserName(): string {
    return this.userName;
  }

  // სისტემიდან გასვლის ფუნქცია
  logout(event?: Event): void {
    if (event) {
      event.preventDefault(); // გვერდის განახლების თავიდან აცილება
    }
    this.userService.logout();
  }
}
