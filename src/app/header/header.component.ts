import { Component, OnInit } from '@angular/core';
import { RouterLink } from '@angular/router';
import { CommonModule } from '@angular/common';
import { UserService } from '../services/user.service';

// @Component დეკორატორი განსაზღვრავს კომპონენტის მეტა-მონაცემებს
@Component({
  selector: 'app-header', // HTML ელემენტის დასახელება, რომლითაც გამოიძახება კომპონენტი
  templateUrl: './header.component.html', // HTML ტემპლეიტის მისამართი
  styleUrls: ['./header.component.css'], // CSS სტილის ფაილის მისამართი
  standalone: true, // standalone კომპონენტის მიდგომა (Angular 14+)
  imports: [CommonModule, RouterLink], // საჭირო მოდულების იმპორტი
})
export class HeaderComponent implements OnInit {
  userName: string = 'მომხმარებელი'; // საწყისი სახელი, რომელიც ჩანს ჰედერში

  constructor(
    public userService: UserService // მომხმარებლის სერვისი, public რათა HTML-დან წვდომა იყოს
  ) {}

  // კომპონენტის ინიციალიზაციის დროს გამოძახებული მეთოდი
  ngOnInit(): void {
    // მოვუსმინოთ მომხმარებლის ცვლილებებს რომ სახელი განახლდეს ავტომატურად
    this.userService.currentUser.subscribe((user) => {
      if (user && user.firstName && user.lastName) {
        // თუ გვაქვს სახელი და გვარი, გამოვიყენოთ ორივე
        this.userName = `${user.firstName} ${user.lastName}`;
      } else if (user && user.firstName) {
        // თუ მხოლოდ სახელი გვაქვს
        this.userName = user.firstName;
      } else if (user && user.phoneNumber) {
        // თუ მხოლოდ ტელეფონის ნომერი გვაქვს
        this.userName = user.phoneNumber;
      } else {
        // თუ არცერთი მონაცემი არ გვაქვს
        this.userName = 'მომხმარებელი';
      }
    });
  }

  // შევამოწმოთ თუ შესაძლებელია სახელის გამოტანა - გამოიყენება HTML-დან
  getUserName(): string {
    return this.userName; // დავაბრუნოთ მომხმარებლის სახელი როგორც სტრინგი
  }

  // სისტემიდან გასვლის ფუნქცია - გამოიძახება HTML-დან
  logout(event?: Event): void {
    if (event) {
      event.preventDefault(); // გვერდის განახლების თავიდან აცილება
    }
    this.userService.logout(); // გამოვიძახოთ სერვისის logout მეთოდი
  }
}
