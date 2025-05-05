import { bootstrapApplication } from '@angular/platform-browser';
import { appConfig } from './app/app.config';
import { AppComponent } from './app/app.component';

// აპლიკაციის ბუტსტრაპი - ეს არის აპლიკაციის შესვლის წერტილი
// bootstrapApplication არის ფუნქცია, რომელიც იწყებს Angular აპლიკაციას
// პირველი პარამეტრი არის მთავარი კომპონენტი (AppComponent)
// მეორე პარამეტრი არის აპლიკაციის კონფიგურაცია (appConfig)
bootstrapApplication(AppComponent, appConfig).catch((err) =>
  console.error(err)
); // შეცდომის დამუშავება
