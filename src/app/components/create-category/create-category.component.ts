import { Component, OnInit, ViewChild, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators, NgForm } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { Category } from './../../models/NewCategory';
import { CategoriesService } from './../../services/categories.service';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

interface CategoryResponse {
  message: string;
  isSaved: boolean;
}

@Component({
  selector: 'app-create-category',
  templateUrl: './create-category.component.html',
  styleUrls: ['./create-category.component.scss']
})
export class CreateCategoryComponent implements OnInit, OnDestroy {
  createCategoryForm: FormGroup;
  sendingRequest = false;
  private ngUnsubscribe = new Subject();

  @ViewChild('formDirective', {static: false})
  private formDirective: NgForm;

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private categoriesService: CategoriesService
  ) { }

  ngOnInit() {
    this.initForm();
  }

  initForm() {
    this.createCategoryForm = this.fb.group({
      name: ['', [
        Validators.required,
        Validators.minLength(2)
       ]
      ],
      limit: ['', [
        Validators.required,
        Validators.min(1)
       ]
      ],
    });
  }

  onSubmit(formData: Category) {
    this.sendingRequest = true;
    this.categoriesService.createCategory(formData).pipe(
      finalize(() => this.sendingRequest = false),
      takeUntil(this.ngUnsubscribe)
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

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }

}
