import { NgModule } from '@angular/core';
import { RainModule } from './rain/rain.module';

const features = [RainModule];

@NgModule({
  imports: features,
  exports: features,
})
export class FeaturesModule {}
