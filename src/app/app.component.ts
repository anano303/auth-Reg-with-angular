import { Component } from '@angular/core';
import { RouterOutlet } from '@angular/router';
import { HeaderComponent } from './header/header.component';

// @Component დეკორატორი განსაზღვრავს აპლიკაციის მთავარი კომპონენტის მეტა-მონაცემებს
@Component({
  selector: 'app-root', // HTML ელემენტის დასახელება, რომლითაც გამოიძახება კომპონენტი
  templateUrl: './app.component.html', // HTML ტემპლეიტის მისამართი
  standalone: true, // standalone კომპონენტის მიდგომა (Angular 14+)
  imports: [RouterOutlet, HeaderComponent], // საჭირო მოდულების იმპორტი - RouterOutlet მარშრუტიზაციისთვის და HeaderComponent ჰედერისთვის
})
export class AppComponent {
  title = 'Angular Project'; // აპლიკაციის სათაური
  // ეს კომპონენტი არის აპლიკაციის მთავარი კომპონენტი, რომელიც ჩატვირთულია bootstrap-ის მეშვეობით
  // მისი HTML ტემპლეიტი შეიცავს ჰედერს და მარშრუტიზატორის გამომავალ ობიექტს
}
