import { StateService } from '@app/services/state/state.service';
import {
  RainState,
  rainInitialState,
  RainInitDto,
  CONST_DROP_WIDTH,
  CONST_DROP_COLOR,
  CONST_DROP_SIDES_RATIO,
  RainDrop,
  CONST_DROPS_AMOUNT,
  CONST_DROPS_SPEED,
  CONST_DROPS_ADDING_CHANCE,
} from './rain.model';
import { Injectable } from '@angular/core';
import * as PIXI from 'pixi.js';

@Injectable()
export class RainService extends StateService<RainState> {
  constructor() {
    super(rainInitialState);
  }

  private static getGraphicsForDrop = (drop: RainDrop): PIXI.Graphics => {
    const line = new PIXI.Graphics();
    line.lineStyle(CONST_DROP_WIDTH, CONST_DROP_COLOR);

    const lineA =
      drop.length / Math.sqrt(Math.pow(CONST_DROP_SIDES_RATIO, 2) + 1);
    const lineB = lineA * CONST_DROP_SIDES_RATIO;
    line.moveTo(0, 0);
    line.lineTo(lineA, lineB);
    line.x = drop.x;
    line.y = drop.y;
    line.cacheAsBitmap = true; // ???

    return line;
  };

  private isDropOutOfView = (drop: RainDrop): boolean => {
    const { containerWidth, containerHeight } = this.state;
    return drop.x > containerWidth || drop.y > containerHeight;
  };

  private get randomStartingPoint(): PIXI.Point {
    const { containerWidth, containerHeight } = this.state;
    const XY_RATIO = containerWidth / containerHeight;

    if (Math.random() * (XY_RATIO + 1) > XY_RATIO) {
      return new PIXI.Point(Math.round(Math.random() * containerWidth), 0);
    } else {
      return new PIXI.Point(0, Math.round(Math.random() * containerHeight));
    }
  }

  private createDrop = (): RainDrop => {
    const drop = new RainDrop();
    const { x, y } = this.randomStartingPoint;

    drop.x = x;
    drop.y = y;
    drop.length = 20 + Math.round(Math.random() * 20); // 20 - 40

    drop.graphics = RainService.getGraphicsForDrop(drop);

    return drop;
  };

  init = (dto: RainInitDto): void => {
    PIXI.utils.sayHello(PIXI.utils.isWebGLSupported() ? 'WebGL' : 'canvas');

    PIXI.settings.SCALE_MODE = PIXI.SCALE_MODES.NEAREST;

    const { container, containerWidth, containerHeight } = dto;
    this.setState({
      app: new PIXI.Application({
        width: containerWidth,
        height: containerHeight,
      }),
      loader: new PIXI.Loader(),
      containerWidth,
      containerHeight,
    });

    this.state.app.renderer.backgroundColor = this.state.backgroundColor;

    container.appendChild(this.state.app.view);

    this.state.loader
      .add([])
      .on('progress', this.handleLoadProgress.bind(this))
      .load(this.setupScenes.bind(this));
  };

  resizeContainer = (width: number, height: number): void => {
    const { app } = this.state;
    app.renderer.resize(width, height);

    this.setState({
      containerWidth: width,
      containerHeight: height,
    });
  };

  private handleLoadProgress = (
    loader: PIXI.Loader,
    resource: PIXI.LoaderResource
  ): void => {
    this.setState({
      spriteLoading: resource.url,
      spritesLoadingProgress: loader.progress,
    });
  };

  private setupScenes = (): void => {
    const { app } = this.state;
    const drops = Array(Math.round(CONST_DROPS_AMOUNT * 0.1))
      .fill(null)
      .map(() => this.createDrop());

    for (const drop of drops) {
      app.stage.addChild(drop.graphics);
    }

    this.setState({
      drops,
      isStageSetup: true,
    });
  };

  updateDrops = (): void => {
    const { app, drops } = this.state;

    if (
      drops.length < CONST_DROPS_AMOUNT &&
      Math.random() < CONST_DROPS_ADDING_CHANCE
    ) {
      const newDrop = this.createDrop();
      app.stage.addChild(newDrop.graphics);

      drops.push(newDrop);
      this.setState({ drops });
    }

    for (const drop of drops) {
      drop.x += CONST_DROPS_SPEED;
      drop.y += CONST_DROPS_SPEED * CONST_DROP_SIDES_RATIO;

      if (this.isDropOutOfView(drop)) {
        const { x, y } = this.randomStartingPoint;
        drop.x = x;
        drop.y = y;
      }

      drop.graphics.x = drop.x;
      drop.graphics.y = drop.y;
    }
  };
}
