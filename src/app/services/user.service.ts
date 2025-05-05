import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { BehaviorSubject, Observable, tap } from 'rxjs';
import { UserDTO } from '../models/userDTO.model';
import { User } from '../models/user.model';

@Injectable({
  providedIn: 'root',
})
export class UserService {
  private apiUrl = 'https://rentcar.stepprojects.ge/api/Users';
  private currentUserSubject: BehaviorSubject<User | null> =
    new BehaviorSubject<User | null>(null);
  public currentUser: Observable<User | null> =
    this.currentUserSubject.asObservable();
  private tokenCheckInterval: any;

  constructor(private http: HttpClient) {
    this.initUserFromStorage();
    this.startTokenValidityCheck();
  }

  // Initialize user from localStorage - safer approach
  private initUserFromStorage(): void {
    try {
      const savedUserString = localStorage.getItem('currentUser');
      // Only attempt to parse if the string is not null or undefined
      if (
        savedUserString &&
        savedUserString !== 'undefined' &&
        savedUserString !== 'null'
      ) {
        const savedUser = JSON.parse(savedUserString);
        this.currentUserSubject.next(savedUser);
        console.log('User loaded from storage:', !!savedUser);
      } else {
        console.log('No valid user data in storage');
      }
    } catch (error) {
      console.error('Error loading user data from localStorage:', error);
      // Clear potentially corrupted data
      localStorage.removeItem('currentUser');
      localStorage.removeItem('token');
    }
  }

  // Register new user
  register(user: UserDTO): Observable<any> {
    return this.http.post<any>(`${this.apiUrl}/register`, user);
  }

  // Login user - completely revised for reliability
  login(user: Partial<UserDTO>): Observable<any> {
    console.log('ავტორიზაციის მცდელობა:', user);

    return this.http.post<any>(`${this.apiUrl}/login`, user).pipe(
      tap({
        next: (response) => {
          console.log('API პასუხი:', response);

          // Make sure we have a token before proceeding
          if (response && response.token) {
            try {
              // Store token first
              localStorage.setItem('token', response.token);

              // Then store user data if available
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
              // Even if storage fails, we can still update the in-memory state
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

  // ახალი მეთოდი: მომხმარებლის დეტალური ინფორმაციის მიღება
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

    // HTTP ჰედერების კონფიგურაცია
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

  // Logout user
  logout() {
    localStorage.removeItem('currentUser');
    localStorage.removeItem('token');
    this.currentUserSubject.next(null);
    console.log('User logged out');
  }

  // Get current logged in user
  public get currentUserValue(): User | null {
    return this.currentUserSubject.value;
  }

  // Enhanced isLoggedIn check - more reliable
  isLoggedIn(): boolean {
    try {
      const hasToken = !!localStorage.getItem('token');
      const hasUser =
        !!this.currentUserValue || !!localStorage.getItem('currentUser');
      const isLoggedIn = hasToken && hasUser;
      console.log(
        `Auth check: hasToken=${hasToken}, hasUser=${hasUser}, isLoggedIn=${isLoggedIn}`
      );
      return isLoggedIn;
    } catch (e) {
      console.error('Error checking login status:', e);
      return false;
    }
  }

  // Start periodic check for token validity
  private startTokenValidityCheck(): void {
    // Check token validity every 30 seconds
    this.tokenCheckInterval = setInterval(() => {
      this.checkAndUpdateAuthStatus();
    }, 30000);
  }

  // Check if the token is still valid
  private checkAndUpdateAuthStatus(): void {
    try {
      const token = localStorage.getItem('token');
      if (!token) {
        // No token found, log out
        console.log('No auth token found, logging out');
        this.logout();
        return;
      }

      // Check if token is expired (if it's JWT)
      if (this.isTokenExpired(token)) {
        console.log('Auth token expired, logging out');
        this.logout();
      }
    } catch (error) {
      console.error('Error checking token validity:', error);
    }
  }

  // Basic check for JWT token expiration
  private isTokenExpired(token: string): boolean {
    try {
      // For JWT tokens - decode and check expiration
      // This is a simple implementation, more robust implementations would use a JWT library
      const tokenParts = token.split('.');
      if (tokenParts.length !== 3) {
        // Not a JWT token, can't determine if expired
        return false;
      }

      const payload = JSON.parse(atob(tokenParts[1]));
      if (!payload.exp) {
        // No expiration claim
        return false;
      }

      // Check if token is expired (exp is in seconds, Date.now() is in milliseconds)
      return payload.exp * 1000 < Date.now();
    } catch (e) {
      // If there's an error parsing, conservatively assume token is valid
      return false;
    }
  }

  // Clean up on service destroy
  ngOnDestroy(): void {
    if (this.tokenCheckInterval) {
      clearInterval(this.tokenCheckInterval);
    }
  }
}
