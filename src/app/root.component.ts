import {
  Component,
  ChangeDetectionStrategy,
  OnInit,
  ElementRef,
  ViewChild,
} from '@angular/core';
import * as PIXI from 'pixi.js';
import { interval, BehaviorSubject } from 'rxjs';
import { animationFrame } from 'rxjs/internal/scheduler/animationFrame';

@Component({
  selector: 'app-root',
  templateUrl: './root.component.html',
  styleUrls: ['./root.component.scss'],
  changeDetection: ChangeDetectionStrategy.OnPush,
})
export class RootComponent implements OnInit {
  @ViewChild('renderContainer', { static: true })
  renderContainer: ElementRef;

  app: PIXI.Application;
  loader: PIXI.Loader;
  blastoise: PIXI.Sprite;

  readonly blastoiseResource = 'assets/sprites/blastoise.png';

  isBlastoiseVisible = new BehaviorSubject(true);

  ngOnInit() {
    const type = PIXI.utils.isWebGLSupported() ? 'WebGL' : 'canvas';
    PIXI.utils.sayHello(type);

    // todo: check platform
    // todo: inject window
    // todo: resize container on window resize
    this.app = new PIXI.Application({
      width: window.innerWidth,
      height: window.innerHeight,
    });
    this.renderContainer.nativeElement.appendChild(this.app.view);

    this.app.renderer.backgroundColor = 0x0c0c0c;

    this.loader = new PIXI.Loader();
    this.loader
      .add([this.blastoiseResource])
      .on('progress', this.handleLoadProgress.bind(this))
      .load(this.setup.bind(this));
  }

  handleLoadProgress = (
    loader: PIXI.Loader,
    resource: PIXI.LoaderResource
  ): void => {
    // tslint:disable-next-line:no-console
    console.log(`Loaded: ${resource.url} (${loader.progress.toFixed(2)}%)`);
  };

  setup = (): void => {
    this.blastoise = new PIXI.Sprite(
      this.loader.resources[this.blastoiseResource].texture
    );

    this.blastoise.x = 0;
    this.blastoise.y = 0;

    this.app.stage.addChild(this.blastoise);

    interval(0, animationFrame).subscribe(this.renderLoop.bind(this));
  };

  renderLoop = (): void => {
    if (this.isBlastoiseVisible.value) {
      // todo: use velocity
      this.blastoise.x += 1;
      this.blastoise.y += 1;
    }

    // tmp
    this.isBlastoiseVisible.next(
      this.blastoise.x < this.app.screen.width &&
        this.blastoise.y < this.app.screen.height
    );
  };
}
