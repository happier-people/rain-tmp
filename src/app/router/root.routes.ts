import { Routes } from '@angular/router';
import { RootComponent } from '@app/root.component';
import { RainComponent } from '@app/features/rain/rain.component';

export const routes: Routes = [
  {
    path: '',
    component: RootComponent,
    children: [
      {
        path: '',
        pathMatch: 'full',
        component: RainComponent,
      },
    ],
  },
];
