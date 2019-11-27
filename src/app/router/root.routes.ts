import { Routes } from '@angular/router';
import { RootComponent } from '@app/root.component';

export const routes: Routes = [
  {
    path: '',
    pathMatch: 'full',
    component: RootComponent,
  },
];
