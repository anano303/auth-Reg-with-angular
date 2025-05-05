import { Component, OnInit } from '@angular/core';
import { CommonModule } from '@angular/common';
import {
  FormBuilder,
  FormGroup,
  Validators,
  ReactiveFormsModule,
} from '@angular/forms';
import { Router, RouterLink } from '@angular/router';
import { UserService } from '../../services/user.service';

// @Component დეკორატორი განსაზღვრავს კომპონენტის მეტა-მონაცემებს
@Component({
  selector: 'app-login', // HTML ელემენტის დასახელება, რომლითაც გამოიძახება კომპონენტი
  templateUrl: './login.component.html', // HTML ტემპლეიტის მისამართი
  styleUrls: ['./login.component.css'], // CSS სტილის ფაილის მისამართი
  standalone: true, // standalone კომპონენტის მიდგომა (Angular 14+)
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // საჭირო მოდულების იმპორტი
})
export class LoginComponent implements OnInit {
  // ფორმის ინიციალიზაცია, რომელიც შეივსება ngOnInit-ში
  loginForm!: FormGroup;
  loading = false; // მიმდინარეობს თუ არა მოთხოვნის გაგზავნა
  success = false; // წარმატებულია თუ არა ავტორიზაცია
  error = ''; // შეცდომის შეტყობინება, თუ რამე შეცდომა მოხდა

  constructor(
    private formBuilder: FormBuilder, // ფორმების შესაქმნელად
    private router: Router, // გადამისამართებისთვის
    private userService: UserService // მომხმარებლის სერვისი API-სთან სამუშაოდ
  ) {}

  // კომპონენტის ინიციალიზაციის დროს გამოძახებული მეთოდი
  ngOnInit(): void {
    // თუ უკვე ავტორიზებულია, გადავიდეს მთავარ გვერდზე
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    // ავტორიზაციის ფორმის შექმნა ვალიდაციის წესებით
    this.loginForm = this.formBuilder.group({
      phoneNumber: ['', Validators.required], // ტელეფონის ნომერი - აუცილებელია
      password: ['', Validators.required], // პაროლი - აუცილებელია
    });
  }

  // წვდომა ფორმის კონტროლებზე უფრო მოკლე სინტაქსით
  get f() {
    return this.loginForm.controls;
  }

  // ფორმის გაგზავნის დამუშავება
  onSubmit() {
    // თუ ფორმა არავალიდურია, გავჩერდეთ აქ
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true; // ჩავრთოთ loading მდგომარეობა
    this.error = ''; // გავასუფთაოთ წინა შეცდომები

    // გავაგზავნოთ ავტორიზაციის მოთხოვნა სერვისის გამოყენებით
    this.userService
      .login({
        phoneNumber: this.f['phoneNumber'].value,
        password: this.f['password'].value,
      })
      .subscribe({
        next: (response) => {
          // დავლოგოთ მიღებული პასუხი
          console.log('ავტორიზაციის პასუხი:', response);

          this.success = true; // ავტორიზაცია წარმატებულია

          // ცადეთ მომხმარებლის სრული ინფორმაციის მიღება
          this.userService.fetchUserDetails().subscribe({
            next: (userDetails) => {
              console.log('მომხმარებლის სრული ინფორმაცია:', userDetails);
              this.loading = false; // გამოვრთოთ loading მდგომარეობა

              // წარმატებული ავტორიზაციის შემდეგ გადავიდეს მთავარ გვერდზე 1 წამში
              setTimeout(() => {
                this.router.navigate(['/']);
              }, 1000);
            },
            error: (err) => {
              console.error('მომხმარებლის დეტალების მიღება ვერ მოხერხდა:', err);
              this.loading = false; // გამოვრთოთ loading მდგომარეობა

              // მაინც გადავიდეს მთავარ გვერდზე, თუნდაც არასრული ინფორმაციით
              setTimeout(() => {
                this.router.navigate(['/']);
              }, 1000);
            },
          });
        },
        error: (error) => {
          // ავტორიზაციის შეცდომის შემთხვევაში
          this.error =
            'ავტორიზაცია ვერ მოხერხდა. გთხოვთ, შეამოწმეთ სახელი და პაროლი';
          this.loading = false; // გამოვრთოთ loading მდგომარეობა
          console.error('Login error', error); // დავლოგოთ შეცდომა კონსოლში
        },
      });
  }
}
