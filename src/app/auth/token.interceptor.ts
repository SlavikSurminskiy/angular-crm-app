import { Injectable } from '@angular/core';
import { Router } from '@angular/router';
import { Observable, throwError } from 'rxjs';
import { tap, catchError } from 'rxjs/operators';
import {
  HttpRequest,
  HttpHandler,
  HttpEvent,
  HttpInterceptor,
  HttpErrorResponse,
} from '@angular/common/http';
import { MatDialog } from '@angular/material/dialog';
import { RedirectPopupComponent } from './../components/redirect-popup/redirect-popup.component';
import { AuthService } from './../services/auth.service';

@Injectable()
export class TokenInterceptor implements HttpInterceptor {
  constructor(
    private router: Router,
    private popup: MatDialog,
    private authService: AuthService
  ) { }
  intercept(request: HttpRequest<any>, next: HttpHandler): Observable<HttpEvent<any>> {

    const token = localStorage.getItem('token');

    request = request.clone({
      setHeaders: {
        Authorization: `Bearer ${token}`
      }
    });

    return next.handle(request).pipe(
      tap((event: HttpEvent<any>) => event),
      catchError((error: HttpErrorResponse) => {
        const isVerifyTokenRequest = error.url.includes('/api/verifytoken');

        const isTokenValid = error.headers.get('token-valid') === 'true';

        if (!isVerifyTokenRequest && !isTokenValid && error.status === 401) {
          const popupRef = this.popup.open(RedirectPopupComponent, {
            width: '350px',
            data: {
              message: 'Session was ended, please relogin',
            }
          });
          popupRef.afterClosed().subscribe(redirectToLogin => {
            if (redirectToLogin) {
              this.authService.logOut();
              this.router.navigateByUrl('login');
            }
          });
        }
        return throwError(error);
      })
    );
  }
}
