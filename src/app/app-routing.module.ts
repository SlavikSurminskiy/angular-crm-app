import { NgModule } from '@angular/core';
import { Routes, RouterModule } from '@angular/router';

import { HomeComponent } from './pages/home/home.component';
import { RegistrationComponent } from './components/registration/registration.component';
import { LoginComponent } from './components/login/login.component';
import { LogoutComponent } from './components/logout/logout.component';
import { CategoriesComponent } from './pages/categories/categories.component';

const routes: Routes = [
  {
    path: '',
    component: HomeComponent,
  },
  {
    path: 'registration',
    component: RegistrationComponent,
  },
  {
    path: 'login',
    component: LoginComponent,
  },
  {
    path: 'logout',
    component: LogoutComponent,
  },
  {
    path: 'categories',
    component: CategoriesComponent,
  },
];

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule]
})
export class AppRoutingModule { }
