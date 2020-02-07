import { User } from './../models/NewUser';
import { Injectable } from '@angular/core';
import { HttpClient, HttpHeaders } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { tap } from 'rxjs/operators';

import { UserLoginData } from '../models/NewUser';

interface TokenStatus {
  isTokenValid: boolean;
}

@Injectable({
  providedIn: 'root'
})
export class AuthService {
  isLogin$ = new BehaviorSubject(false);

  constructor(private http: HttpClient) {}

  verifyToken() {
    const token = localStorage.getItem('token');
    if (token) {
      this.http.post('/api/verifytoken', {})
      .subscribe((res: TokenStatus) => {
        if (res.isTokenValid) {
          this.isLogin$.next(true);
        }
      });
    }
  }

  logIn(credentials: UserLoginData): Observable<any> {
    return this.http.post<any>('/api/login', credentials).pipe(
      tap(res => {
        if (res.token) {
          this.isLogin$.next(true);
          localStorage.setItem('token', res.token);
          localStorage.setItem('user', JSON.stringify(res.user));
        }
      })
    );
  }

  logOut() {
    this.isLogin$.next(false);
    localStorage.removeItem('token');
    localStorage.removeItem('user');
  }

}
