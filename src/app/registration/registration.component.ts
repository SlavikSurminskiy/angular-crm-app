import { Component, OnInit, ViewChild } from '@angular/core';
import {
  NgForm,
  FormGroup,
  FormBuilder,
  Validators,
  ValidationErrors
} from '@angular/forms';

import { MatSnackBar } from '@angular/material/snack-bar';
import { User } from '../models/NewUser';
import { RegistrationService } from '../services/registration.service';

interface FormData {
  firsName: string;
  lastName: string;
  email: string;
  passwordForm: {
    password: string;
    passwordConfirm: string;
  };
}

@Component({
  selector: 'app-registration',
  templateUrl: './registration.component.html',
  styleUrls: ['./registration.component.scss']
})
export class RegistrationComponent implements OnInit {
  registrationForm: FormGroup;
  sendingRequest = false;

  @ViewChild('formDirective', {static: false})
  private formDirective: NgForm;

  constructor(
    private fb: FormBuilder,
    private registrationService: RegistrationService,
    private snackBar: MatSnackBar,
  ) {}


  ngOnInit() {
   this.initForm();
  }

  initForm() {
   this.registrationForm = this.fb.group({
    firstName: ['', [
      Validators.required,
      Validators.pattern(/^[a-zA-ZА-Яа-яёЁЇїІіЄєҐґ]{2,15}$/),
     ]
    ],
    lastName: ['', [
      Validators.required,
      Validators.pattern(/^[a-zA-ZА-Яа-яёЁЇїІіЄєҐґ]{2,15}$/),
     ]
    ],
    email: ['', [
      Validators.required,
      Validators.email
     ]
    ],
    passwordForm: this.fb.group({
      password: ['', [
        Validators.required,
        Validators.minLength(6),
       ]
      ],
      passwordConfirm: ['', [
        Validators.required,
        Validators.minLength(6)
       ]
      ],
    }, {validators: this.isPasswordConfirmed})
   });
  }

  isPasswordConfirmed(control: FormGroup): ValidationErrors | null {
    const password: string = control.get('password').value;
    const passwordConfirm: string = control.get('passwordConfirm').value;
    if (password === passwordConfirm) {
      return null;
    } else {
      return { isPasswordSame: false };
    }
  }

  get isPasswordDifferent() {
    const passwordForm = this.registrationForm.get('passwordForm').get('passwordConfirm');
    const errors = this.registrationForm.get('passwordForm').errors;
    return errors && (passwordForm.touched || passwordForm.dirty);
  }

  onSubmit(formData: FormData) {
    this.sendingRequest = true;
    const { passwordForm: { password }, ...data } = formData;
    const userData: User = { password, ...data };

    this.registrationService.registerNewUser(userData)
    .subscribe(responseMsg => {
      this.sendingRequest = false;
      const { isSaved, message } = responseMsg;

      this.snackBar.open(message, '', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        panelClass: ['snackbar-registration-status'],
      });

      if (isSaved) {
        this.registrationForm.reset();
        this.formDirective.resetForm();
      }
    });
  }

}
