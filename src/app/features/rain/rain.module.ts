import { NgModule } from '@angular/core';
import { CommonModule } from '@angular/common';
import { RainComponent } from './rain.component';
import { RainService } from './rain.service';
import { chanceProvider } from '@app/shared/providers/chance.provider';

@NgModule({
  imports: [CommonModule],
  declarations: [RainComponent],
  exports: [RainComponent],
  providers: [chanceProvider, RainService],
})
export class RainModule {}
