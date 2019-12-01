import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RainComponent } from './rain.component';
import { RainService } from './rain.service';

@NgModule({
  imports: [CommonModule],
  declarations: [RainComponent],
  exports: [RainComponent],
  providers: [RainService],
})
export class RainModule {}
