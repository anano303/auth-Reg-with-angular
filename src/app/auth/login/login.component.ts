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

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class LoginComponent implements OnInit {
  // ფორმის ინიციალიზაცია
  loginForm!: FormGroup;
  loading = false; // მიმდინარეობს თუ არა მოთხოვნის გაგზავნა
  success = false; // წარმატებულია თუ არა ავტორიზაცია
  error = ''; // შეცდომის შეტყობინება

  constructor(
    private formBuilder: FormBuilder, // ფორმების შესაქმნელად
    private router: Router, // გადამისამართებისთვის
    private userService: UserService // მომხმარებლის სერვისი
  ) {}

  ngOnInit(): void {
    // თუ უკვე ავტორიზებულია, გადავიდეს მთავარ გვერდზე
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    // ფორმის შექმნა ვალიდაციით
    this.loginForm = this.formBuilder.group({
      phoneNumber: ['', Validators.required],
      password: ['', Validators.required],
    });
  }

  // წვდომა ფორმის კონტროლებზე
  get f() {
    return this.loginForm.controls;
  }

  // ფორმის გაგზავნის დამუშავება
  onSubmit() {
    // თუ ფორმა არავალიდურია, გავჩერდეთ აქ
    if (this.loginForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    // გავაგზავნოთ ავტორიზაციის მოთხოვნა
    this.userService
      .login({
        phoneNumber: this.f['phoneNumber'].value,
        password: this.f['password'].value,
      })
      .subscribe({
        next: (response) => {
          // დავლოგოთ მიღებული პასუხი
          console.log('ავტორიზაციის პასუხი:', response);

          this.success = true;

          // ცადეთ მომხმარებლის სრული ინფორმაციის მიღება
          this.userService.fetchUserDetails().subscribe({
            next: (userDetails) => {
              console.log('მომხმარებლის სრული ინფორმაცია:', userDetails);
              this.loading = false;

              // წარმატებული ავტორიზაციის შემდეგ გადავიდეს მთავარ გვერდზე
              setTimeout(() => {
                this.router.navigate(['/']);
              }, 1000);
            },
            error: (err) => {
              console.error('მომხმარებლის დეტალების მიღება ვერ მოხერხდა:', err);
              this.loading = false;

              // მაინც გადავიდეს მთავარ გვერდზე, თუნდაც არასრული ინფორმაციით
              setTimeout(() => {
                this.router.navigate(['/']);
              }, 1000);
            },
          });
        },
        error: (error) => {
          this.error =
            'ავტორიზაცია ვერ მოხერხდა. გთხოვთ, შეამოწმეთ სახელი და პაროლი';
          this.loading = false;
          console.error('Login error', error);
        },
      });
  }
}
