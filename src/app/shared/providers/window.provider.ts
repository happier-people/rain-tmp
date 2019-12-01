import { InjectionToken, FactoryProvider, PLATFORM_ID } from '@angular/core';
import { isPlatformBrowser } from '@angular/common';

export const WINDOW = new InjectionToken('WINDOW_PROVIDER_TOKEN');

export const windowProvider: FactoryProvider = {
  provide: WINDOW,
  deps: [PLATFORM_ID],
  useFactory: (platformId: object) => {
    if (isPlatformBrowser(platformId)) {
      return window;
    }

    return {};
  },
};
