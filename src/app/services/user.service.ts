import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserDTO } from '../models/userDTO.model';
import { User } from '../models/user.model';

// @Injectable დეკორატორი აღნიშნავს, რომ ეს სერვისი შეიძლება დაინჯექტდეს სხვა კლასებში
@Injectable({
  providedIn: 'root', // სერვისი ხელმისაწვდომია მთელ აპლიკაციაში
})
export class UserService {
  private apiUrl = 'https://rentcar.stepprojects.ge/api/Users'; // API ენდპოინტის მისამართი

  // BehaviorSubject არის RxJS-ის სპეციალური ტიპი, რომელიც ინახავს მიმდინარე მნიშვნელობას და აწვდის მას ახალ subscription-ებს
  private currentUserSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);

  // Observable მიმდინარე მომხმარებლის მონაცემების მოსასმენად
  public currentUser: Observable<User | null> =
    this.currentUserSubject.asObservable();

  private tokenCheckInterval: any; // ინტერვალი ტოკენის ვადის შესამოწმებლად

  constructor(private http: HttpClient) {
    this.initUserFromStorage(); // ინიციალიზაცია ლოკალური საცავიდან
    this.startTokenValidityCheck(); // ტოკენის ვადის პერიოდული შემოწმების დაწყება
  }

  // მომხმარებლის ინიციალიზაცია localStorage-დან - უსაფრთხო მიდგომა
  private initUserFromStorage(): void {
    try {
      const savedUserString = localStorage.getItem('currentUser');
      // მხოლოდ მაშინ ვცდილობთ გაპარსვას, როდესაც სტრინგი არ არის null ან undefined
      if (
        savedUserString &&
        savedUserString !== 'undefined' &&
        savedUserString !== 'null'
      ) {
        const savedUser = JSON.parse(savedUserString);
        this.currentUserSubject.next(savedUser); // მომხმარებლის ინფორმაციის განახლება BehaviorSubject-ში
        console.log('User loaded from storage:', !!savedUser);
      } else {
        console.log('No valid user data in storage');
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
      // პოტენციურად დაზიანებული მონაცემების წაშლა
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
  }

  // ახალი მომხმარებლის რეგისტრაცია
  register(user: UserDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  // მომხმარებლის ავტორიზაცია - სრულად გადამუშავებული სანდოობისთვის
  login(user: Partial<UserDTO>): Observable<any> {
    console.log('ავტორიზაციის მცდელობა:', user);

    return this.http.post<any>(`${this.apiUrl}/login`, user).pipe(
      tap({
        next: (response) => {
          console.log('API პასუხი:', response);

          // დავრწმუნდეთ, რომ გვაქვს ტოკენი, სანამ გავაგრძელებთ
          if (response && response.token) {
            try {
              // ჯერ შევინახოთ ტოკენი
              localStorage.setItem('token', response.token);

              // შემდეგ შევინახოთ მომხმარებლის მონაცემები, თუ ისინი ხელმისაწვდომია
              if (response.user) {
                // გავრცელებული ობიექტი ყველა მონაცემით
                const fullUser = {
                  ...response.user,
                  token: response.token, // დავამატოთ token-ი მომხმარებლის ობიექტში
                };

                const userJson = JSON.stringify(fullUser);
                localStorage.setItem('currentUser', userJson);
                this.currentUserSubject.next(fullUser);
                console.log(
                  'მომხმარებლის მონაცემები წარმატებით შენახულია:',
                  fullUser
                );
              } else {
                // მინიმალური მომხმარებლის ობიექტის შექმნა
                const minimalUser = {
                  phoneNumber: user.phoneNumber,
                  token: response.token,
                } as User;

                localStorage.setItem(
                  'currentUser',
                  JSON.stringify(minimalUser)
                );
                this.currentUserSubject.next(minimalUser);
                console.log(
                  'შექმნილია მინიმალური მომხმარებლის პროფილი:',
                  minimalUser
                );

                // ცადეთ მომხმარებლის სრული ინფორმაციის მიღება
                this.fetchUserDetails().subscribe({
                  next: (userDetails) => {
                    console.log(
                      'მომხმარებლის დეტალები მიღებულია:',
                      userDetails
                    );
                  },
                  error: (err) => {
                    console.error(
                      'მომხმარებლის დეტალების მიღების შეცდომა:',
                      err
                    );
                  },
                });
              }
            } catch (error) {
              console.error('შეცდომა მონაცემების შენახვისას:', error);
              // მაშინაც კი, თუ ლოკალური შენახვა წარუმატებელია, მაინც შეგვიძლია განვაახლოთ ოპერატიული მეხსიერების მდგომარეობა
              if (response.user) {
                this.currentUserSubject.next(response.user);
              }
            }
          } else {
            console.warn('ავტორიზაციის პასუხში არ არის token');
          }
        },
        error: (error) => {
          console.error('ავტორიზაციის მოთხოვნა წარუმატებელია:', error);
        },
      })
    );
  }

  // ახალი მეთოდი: მომხმარებლის დეტალური ინფორმაციის მიღება API-დან
  fetchUserDetails(): Observable<User> {
    // მოთხოვნაში უნდა გადავცეთ ავტორიზაციის ტოკენი
    const token = localStorage.getItem('token');
    const currentUser = this.currentUserValue;

    // თუ ტოკენი ან მომხმარებლის ნომერი არ არის, შევწყვიტოთ ოპერაცია
    if (!token || !currentUser?.phoneNumber) {
      return new Observable((observer) => {
        observer.error(
          'ტოკენი ან მომხმარებლის ტელეფონის ნომერი არ არის ხელმისაწვდომი'
        );
        observer.complete();
      });
    }

    // HTTP ჰედერების კონფიგურაცია ავტორიზაციის ტოკენით
    const headers = {
      Authorization: `Bearer ${token}`,
      'Content-Type': 'application/json',
    };

    // API მოთხოვნა მომხმარებლის მონაცემების მისაღებად ტელეფონის ნომრით
    return this.http
      .get<User>(`${this.apiUrl}/${currentUser.phoneNumber}`, { headers })
      .pipe(
        tap({
          next: (userDetails) => {
            if (userDetails) {
              // დავამატოთ token-ი მომხმარებლის ობიექტს
              const enrichedUser: User = {
                ...userDetails,
                token: token,
              };

              // განვაახლოთ მომხმარებლის ინფორმაცია localStorage-ში და BehaviorSubject-ში
              localStorage.setItem('currentUser', JSON.stringify(enrichedUser));
              this.currentUserSubject.next(enrichedUser);

              console.log(
                'მომხმარებლის სრული მონაცემები განახლებულია:',
                enrichedUser
              );
            }
          },
          error: (error) => {
            console.error('მომხმარებლის დეტალების მიღების შეცდომა:', error);
            // შეცდომის შემთხვევაში არ გავანულოთ არსებული ინფორმაცია
          },
        })
      );
  }

  // მომხმარებლის გასვლა (logout)
  logout() {
    localStorage.removeItem('currentUser'); // წავშალოთ მომხმარებლის მონაცემები
    localStorage.removeItem('token'); // წავშალოთ ავტორიზაციის ტოკენი
    this.currentUserSubject.next(null); // განვაახლოთ BehaviorSubject null მნიშვნელობით
    console.log('User logged out');
  }

  // მიმდინარე ავტორიზებული მომხმარებლის მიღება
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // გაუმჯობესებული ავტორიზაციის შემოწმება - უფრო სანდო
  isLoggedIn(): boolean {
    try {
      const hasToken = !!localStorage.getItem('token'); // აქვს თუ არა ტოკენი
      const hasUser =
        !!this.currentUserValue || !!localStorage.getItem('currentUser'); // არსებობს თუ არა მომხმარებელი
      const isLoggedIn = hasToken && hasUser; // ავტორიზებულია, თუ ორივე პირობა სრულდება
      console.log(
        `Auth check: hasToken=${hasToken}, hasUser=${hasUser}, isLoggedIn=${isLoggedIn}`
      );
      return isLoggedIn;
    } catch (e) {
      console.error('Error checking login status:', e);
      return false;
    }
  }

  // ტოკენის ვალიდურობის პერიოდული შემოწმების დაწყება
  private startTokenValidityCheck(): void {
    // ტოკენის ვალიდურობის შემოწმება ყოველ 30 წამში
    this.tokenCheckInterval = setInterval(() => {
      this.checkAndUpdateAuthStatus();
    }, 30000);
  }

  // ტოკენის ვალიდურობის შემოწმება და ავტორიზაციის სტატუსის განახლება
  private checkAndUpdateAuthStatus(): void {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // ტოკენი არ მოიძებნა, გავიდეთ სისტემიდან
        console.log('No auth token found, logging out');
        this.logout();
        return;
      }

      // შევამოწმოთ თუ ტოკენს ვადა გაუვიდა (JWT ტოკენის შემთხვევაში)
      if (this.isTokenExpired(token)) {
        console.log('Auth token expired, logging out');
        this.logout();
      }
    } catch (error) {
      console.error('Error checking token validity:', error);
    }
  }

  // JWT ტოკენის ვადის ამოწურვის მარტივი შემოწმება
  private isTokenExpired(token: string): boolean {
    try {
      // JWT ტოკენებისთვის - დეკოდირება და ვადის შემოწმება
      // ეს არის მარტივი იმპლემენტაცია, უფრო მძლავრი იმპლემენტაციები იყენებენ JWT ბიბლიოთეკას
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        // არ არის JWT ტოკენი, ვერ განისაზღვრება ვადა
        return false;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      if (!payload.exp) {
        // არ არსებობს ვადის ამოწურვის მტკიცება
        return false;
      }

      // შევამოწმოთ ტოკენის ვადა (exp არის წამებში, Date.now() არის მილიწამებში)
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      // თუ გაპარსვისას მოხდა შეცდომა, კონსერვატიულად ვივარაუდოთ, რომ ტოკენი ვალიდურია
      return false;
    }
  }

  // სერვისის განადგურებისას რესურსების გასუფთავება
  ngOnDestroy(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
  }
}
