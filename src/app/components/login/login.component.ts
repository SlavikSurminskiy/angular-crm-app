import { Component, OnInit } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';

import { UserLoginData } from '../../models/NewUser';
import { AuthService } from '../../services/auth.service';
import { Router } from '@angular/router';

@Component({
  selector: 'app-login',
  templateUrl: './login.component.html',
  styleUrls: ['./login.component.scss']
})
export class LoginComponent implements OnInit {
  loginForm: FormGroup;
  sendingRequest = false;

  constructor(
    private fb: FormBuilder,
    private authService: AuthService,
    private router: Router,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.loginForm = this.fb.group({
      email: ['', [
        Validators.required,
        Validators.email
       ]
      ],
      password: ['', [
        Validators.required
       ]
      ],
    });
  }

  onSubmit(formData: UserLoginData) {
    this.sendingRequest = true;
    this.authService.logIn(formData)
    .subscribe(res => {
      this.sendingRequest = false;
      const { loginSuccess, message } = res;

      this.snackBar.open(message, 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 3000
      });

      if (loginSuccess) {
        this.router.navigateByUrl('/');
      }

    });
  }

}
