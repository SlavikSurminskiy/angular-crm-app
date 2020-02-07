import { Component, OnInit } from '@angular/core';

import { AuthService } from './services/auth.service';

@Component({
  selector: 'app-root',
  templateUrl: './app.component.html',
  styleUrls: ['./app.component.scss']
})
export class AppComponent implements OnInit {
  title = 'crm-app';

  constructor(private authService: AuthService) { }

  ngOnInit() {
    this.authService.verifyToken();
  }

  get userName() {
    const isUserLogin = this.authService.isLogin$.value && JSON.parse(localStorage.getItem('user'));
    if (isUserLogin) {
      return isUserLogin.firstName;
    }
    return '';
  }

}
