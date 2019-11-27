import { NgModule } from '@angular/core';
import { RouterModule } from '@angular/router';
import { routes } from '@app/router/root.routes';

@NgModule({
  imports: [RouterModule.forRoot(routes)],
  exports: [RouterModule],
})
export class RootRoutingModule {}
