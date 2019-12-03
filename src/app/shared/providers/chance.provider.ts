import { InjectionToken, ValueProvider } from '@angular/core';
import * as Chance from 'chance';

export const CHANCE = new InjectionToken('CHANCE_INJECTION_TOKEN');

export const chanceProvider: ValueProvider = {
  provide: CHANCE,
  useValue: new Chance(),
};
