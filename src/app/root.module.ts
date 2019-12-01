import { BrowserModule } from '@angular/platform-browser';
import { NgModule } from '@angular/core';
import { BrowserAnimationsModule } from '@angular/platform-browser/animations';
import { RootRoutingModule } from './router/root-routing.module';
import { RootComponent } from './root.component';
import { CommonModule } from '@angular/common';
import { FeaturesModule } from './features/features.module';

@NgModule({
  declarations: [RootComponent],
  imports: [
    BrowserModule,
    BrowserAnimationsModule,
    CommonModule,
    FeaturesModule,
    // ServicesModule,
    RootRoutingModule,
    // ApiModule,
    // SharedModule,
  ],
  providers: [],
  bootstrap: [RootComponent],
})
export class RootModule {}
