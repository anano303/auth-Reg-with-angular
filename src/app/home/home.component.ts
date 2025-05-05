import { Component } from '@angular/core';
import { CommonModule } from '@angular/common';

// @Component დეკორატორი განსაზღვრავს კომპონენტის მეტა-მონაცემებს
@Component({
  selector: 'app-home', // HTML ელემენტის დასახელება, რომლითაც გამოიძახება კომპონენტი
  templateUrl: './home.component.html', // HTML ტემპლეიტის მისამართი
  styleUrls: ['./home.component.css'], // CSS სტილის ფაილის მისამართი
  standalone: true, // standalone კომპონენტის მიდგომა (Angular 14+)
  imports: [CommonModule], // საჭირო მოდულების იმპორტი
})
export class HomeComponent {
  // კომპონენტის ლოგიკა შეიძლება აქ გაიწეროს
  // ეს კლასი ამჟამად ცარიელია, რადგან არ აქვს რაიმე სპეციალური ლოგიკა
  // მთავარი გვერდის ფუნქციონალურობა განისაზღვრება HTML ტემპლეიტში
}
