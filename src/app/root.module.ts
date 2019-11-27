import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RootRoutingModule } from './router/root-routing.module';
import { RootComponent } from './root.component';
// import { ApiModule } from './api/api.module';
// import { FeaturesModule } from './features/features.module';
// import { ServicesModule } from './services/services.module';
// import { SharedModule } from './shared/shared.module';
import { CommonModule } from '@angular/common';

@NgModule({
  declarations: [RootComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    // FeaturesModule,
    // ServicesModule,
    RootRoutingModule,
    // ApiModule,
    // SharedModule,
  ],
  providers: [],
  bootstrap: [RootComponent],
})
export class RootModule {}
