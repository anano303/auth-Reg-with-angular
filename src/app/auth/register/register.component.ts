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
  selector: 'app-register',
  templateUrl: './register.component.html',
  styleUrls: ['./register.component.css'],
  standalone: true,
  imports: [CommonModule, ReactiveFormsModule, RouterLink],
})
export class RegisterComponent implements OnInit {
  // ფორმის ინიციალიზაცია
  registerForm!: FormGroup;
  loading = false; // მიმდინარეობს თუ არა მოთხოვნის გაგზავნა
  success = false; // წარმატებულია თუ არა რეგისტრაცია
  error = ''; // შეცდომის შეტყობინება

  constructor(
    private formBuilder: FormBuilder, // ფორმების შესაქმნელად
    private router: Router, // გადამისამართებისთვის
    private userService: UserService // მომხმარებლის სერვისი
  ) {}

  ngOnInit(): void {
    // თუ უკვე ავტორიზებულია, გადამისამართდეს მთავარ გვერდზე
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    // ფორმის შექმნა ვალიდაციით
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required],
      lastName: ['', Validators.required],
      phoneNumber: ['', Validators.required],
      email: ['', [Validators.required, Validators.email]],
      password: ['', [Validators.required, Validators.minLength(6)]],
    });
  }

  // წვდომა ფორმის კონტროლებზე
  get f() {
    return this.registerForm.controls;
  }

  // ფორმის გაგზავნის დამუშავება
  onSubmit() {
    // თუ ფორმა არავალიდურია, გავჩერდეთ აქ
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true;
    this.error = '';

    // გავაგზავნოთ რეგისტრაციის მოთხოვნა
    this.userService.register(this.registerForm.value).subscribe({
      next: () => {
        this.success = true;
        this.loading = false;
        // წარმატებული რეგისტრაციის შემდეგ, გადავიდეს ავტორიზაციის გვერდზე
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        if (error.error && typeof error.error === 'string') {
          this.error = error.error;
        } else {
          this.error = 'რეგისტრაცია ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა';
        }
        this.loading = false;
        console.error('Registration error', error);
      },
    });
  }
}
