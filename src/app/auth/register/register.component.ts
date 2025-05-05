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
  selector: 'app-register', // HTML ელემენტის დასახელება, რომლითაც გამოიძახება კომპონენტი
  templateUrl: './register.component.html', // HTML ტემპლეიტის მისამართი
  styleUrls: ['./register.component.css'], // CSS სტილის ფაილის მისამართი
  standalone: true, // standalone კომპონენტის მიდგომა (Angular 14+)
  imports: [CommonModule, ReactiveFormsModule, RouterLink], // საჭირო მოდულების იმპორტი
})
export class RegisterComponent implements OnInit {
  // ფორმის ინიციალიზაცია, რომელიც შეივსება ngOnInit-ში
  registerForm!: FormGroup;
  loading = false; // მიმდინარეობს თუ არა მოთხოვნის გაგზავნა
  success = false; // წარმატებულია თუ არა რეგისტრაცია
  error = ''; // შეცდომის შეტყობინება, თუ რამე შეცდომა მოხდა

  constructor(
    private formBuilder: FormBuilder, // ფორმების შესაქმნელად
    private router: Router, // გადამისამართებისთვის
    private userService: UserService // მომხმარებლის სერვისი API-სთან სამუშაოდ
  ) {}

  // კომპონენტის ინიციალიზაციის დროს გამოძახებული მეთოდი
  ngOnInit(): void {
    // თუ უკვე ავტორიზებულია, გადამისამართდეს მთავარ გვერდზე
    if (this.userService.isLoggedIn()) {
      this.router.navigate(['/']);
      return;
    }

    // რეგისტრაციის ფორმის შექმნა ვალიდაციის წესებით
    this.registerForm = this.formBuilder.group({
      firstName: ['', Validators.required], // სახელი - აუცილებელია
      lastName: ['', Validators.required], // გვარი - აუცილებელია
      phoneNumber: ['', Validators.required], // ტელეფონი - აუცილებელია
      email: ['', [Validators.required, Validators.email]], // ელფოსტა - აუცილებელია და უნდა იყოს სწორი ფორმატით
      password: ['', [Validators.required, Validators.minLength(6)]], // პაროლი - მინიმუმ 6 სიმბოლო
    });
  }

  // წვდომა ფორმის კონტროლებზე უფრო მოკლე სინტაქსით
  get f() {
    return this.registerForm.controls;
  }

  // ფორმის გაგზავნის დამუშავება
  onSubmit() {
    // თუ ფორმა არავალიდურია, გავჩერდეთ აქ
    if (this.registerForm.invalid) {
      return;
    }

    this.loading = true; // ჩავრთოთ loading მდგომარეობა
    this.error = ''; // გავასუფთაოთ წინა შეცდომები

    // გავაგზავნოთ რეგისტრაციის მოთხოვნა სერვისის გამოყენებით
    this.userService.register(this.registerForm.value).subscribe({
      next: () => {
        // წარმატების შემთხვევაში
        this.success = true;
        this.loading = false;
        // წარმატებული რეგისტრაციის შემდეგ, გადავიდეს ავტორიზაციის გვერდზე 2 წამში
        setTimeout(() => {
          this.router.navigate(['/login']);
        }, 2000);
      },
      error: (error) => {
        // შეცდომის შემთხვევაში
        if (error.error && typeof error.error === 'string') {
          this.error = error.error; // სერვერიდან მიღებული შეცდომის შეტყობინება
        } else {
          this.error = 'რეგისტრაცია ვერ მოხერხდა. გთხოვთ, სცადოთ ხელახლა'; // სტანდარტული შეცდომის შეტყობინება
        }
        this.loading = false; // გამოვრთოთ loading მდგომარეობა
        console.error('Registration error', error); // დავლოგოთ შეცდომა კონსოლში
      },
    });
  }
}
