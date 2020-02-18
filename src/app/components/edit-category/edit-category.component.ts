import { Component, OnInit, OnDestroy } from '@angular/core';
import { FormGroup, FormBuilder, Validators } from '@angular/forms';
import { MatSnackBar } from '@angular/material/snack-bar';
import { CategoriesService } from './../../services/categories.service';
import { Category } from './../../models/NewCategory';
import { Subject } from 'rxjs';
import { finalize, takeUntil } from 'rxjs/operators';

interface CategoryStatus {
  message: string;
  isUpdated: boolean;
}

@Component({
  selector: 'app-edit-category',
  templateUrl: './edit-category.component.html',
  styleUrls: ['./edit-category.component.scss']
})
export class EditCategoryComponent implements OnInit, OnDestroy {
  editCategoryForm: FormGroup;
  categories: Array<Category> = [];
  sendingRequest = false;
  private ngUnsubscribe = new Subject();

  constructor(
    private fb: FormBuilder,
    private snackBar: MatSnackBar,
    private categoriesService: CategoriesService,
  ) { }

  ngOnInit() {
    this.initForm();
    this.categoriesService.loadCategories();
    this.categoriesService.categories$.subscribe(categories => {
      this.categories = categories;
    });
  }

  initForm() {
    this.editCategoryForm = this.fb.group({
      selectedCategory: ['', [
        Validators.required
        ]
      ],
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
    this.categoriesService.updateCategory(formData).pipe(
      finalize(() => this.sendingRequest = false),
      takeUntil(this.ngUnsubscribe)
    ).subscribe((categoryStatus: CategoryStatus) => {
      const { message } = categoryStatus;

      this.snackBar.open(message, 'OK', {
        horizontalPosition: 'right',
        verticalPosition: 'bottom',
        duration: 3000
      });
    });
  }

  changeCategory(value: string) {
    const selectedCategory = this.categories.filter(cat => cat._id === value)[0];
    this.editCategoryForm.get('name').setValue(selectedCategory.name);
    this.editCategoryForm.get('limit').setValue(selectedCategory.limit);
  }

  ngOnDestroy() {
    this.ngUnsubscribe.next();
    this.ngUnsubscribe.complete();
  }
}
