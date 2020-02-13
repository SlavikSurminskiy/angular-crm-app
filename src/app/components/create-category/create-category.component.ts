import { Component, OnInit, ViewChild } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { FormGroup, FormBuilder, Validators, NgForm} from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { finalize } from 'rxjs/operators';

import { Category } from './../../models/NewCategory';

interface CategoryResponse {
  message: string;
  isSaved: boolean;
}

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.scss']
})
export class CreateCategoryComponent implements OnInit {
  createCategoryForm: FormGroup;
  sendingRequest = false;

  @ViewChild('formDirective', {static: false})
  private formDirective: NgForm;

  constructor(
    private http: HttpClient,
    private fb: FormBuilder,
    private snackBar: MatSnackBar
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.createCategoryForm = this.fb.group({
      categoryName: ['', [
        Validators.required,
        Validators.minLength(2)
       ]
      ],
      categoryLimit: ['', [
        Validators.required,
        Validators.min(1)
       ]
      ],
    });
  }

  onSubmit(formData: Category) {
    this.sendingRequest = true;
    this.http.post('/api/createCategory', formData).pipe(
      finalize(() => this.sendingRequest = false)
    ).subscribe((res: CategoryResponse) => {
      const { message, isSaved } = res;

      this.snackBar.open(message, 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 3000
      });

      if (isSaved) {
        this.createCategoryForm.reset();
        this.formDirective.resetForm();
      }
    });
  }

}
