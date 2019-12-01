import { enableProdMode } from '@angular/core';
import { platformBrowserDynamic } from '@angular/platform-browser-dynamic';

import { RootModule } from './app/root.module';
import { environment } from './environments/environment';

if (environment.production) {
  enableProdMode();
}

platformBrowserDynamic()
  .bootstrapModule(RootModule)
  .catch(err => console.error(err));

if (environment.production && 'serviceWorker' in navigator) {
  // for some reasons, ServiceWorkerModule.register('ngsw-worker.js')
  // didn't work, so I had to do it this way
  navigator.serviceWorker.register('ngsw-worker.js');
}
