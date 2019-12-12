import { Injectable, EventEmitter } from '@angular/core';
import * as Shake from 'shake.js';

@Injectable()
export class DeviceMotionService {
  private windowRef: Window;
  private shakeInstance: Shake;

  onShake = new EventEmitter<void>();

  constructor() {}

  init = (windowRef: Window): void => {
    this.windowRef = windowRef;

    this.shakeInstance = new Shake({
      threshold: 15, // optional shake strength threshold
      timeout: 1000, // optional, determines the frequency of event generation
    });

    this.shakeInstance.start();

    this.windowRef.addEventListener('shake', this.shakeListener, false);
  };

  private shakeListener = (): void => {
    this.onShake.emit();
  };

  disconnect = (): void => {
    this.windowRef.removeEventListener('shake', this.shakeListener, false);

    if (this.shakeInstance) {
      this.shakeInstance.stop();
    }
  };
}
