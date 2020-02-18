import { Injectable } from '@angular/core';
import { HttpClient } from '@angular/common/http';
import { Observable, BehaviorSubject } from 'rxjs';
import { Category } from './../models/NewCategory';
import { map } from 'rxjs/operators';

interface CategoryResponse {
  message: string;
  isSaved: boolean;
  savedCategory: Category;
}
interface CategoryUpdatedResponse {
  message: string;
  isUpdated: boolean;
  updatedCategory: Category;
}

@Injectable({
  providedIn: 'root'
})
export class CategoriesService {

  private _categories: BehaviorSubject<Array<Category>> = new BehaviorSubject([]);

  public readonly categories$: Observable<Array<Category>> = this._categories.asObservable();

  constructor(private http: HttpClient) { }

  loadCategories() {
    this.http.get('api/categories').subscribe((res: Array<Category>) => {
      this._categories.next(res);
    });
  }

  createCategory(newCategory: Category) {
    return this.http.post('/api/createCategory', newCategory).pipe(
      map((res: CategoryResponse) => {
        const { savedCategory, ...rest } = res;
        if (savedCategory) {
          this._categories.next([...this._categories.getValue(), savedCategory]);
        }
        return rest;
      })
    );
  }

  updateCategory(category: Category) {
    return this.http.post('/api/updateCategory', category).pipe(
      map((res: CategoryUpdatedResponse) => {
        const { updatedCategory, ...rest } = res;
        if (updatedCategory) {
          const updatedCategories = this._categories.getValue().map(cat => {
            if (cat._id === updatedCategory._id) {
              cat = updatedCategory;
            }
            return cat;
          });
          this._categories.next(updatedCategories);
        }
        return rest;
      })
    );
  }
}
