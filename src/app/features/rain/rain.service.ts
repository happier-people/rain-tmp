import { StateService } from '@app/services/state/state.service';
import {
  RainState,
  rainInitialState,
  RainInitDto,
  CONST_DROP_WIDTH,
  CONST_DROP_COLOR,
  CONST_DROP_SIDES_RATIO,
  RainDrop,
  CONST_DROPS_SPEED,
  CONST_DROPS_ADDING_CHANCE,
  CONST_PIXELS_PER_DROP,
  CONST_USE_PIXELLATION,
  CONST_PIXELLATION_SIZE,
  CONST_SPEED_DELTA,
} from './rain.model';
import { Injectable } from '@angular/core';
import { PixelateFilter } from '@pixi/filter-pixelate';
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
    const from = -containerHeight / CONST_DROP_SIDES_RATIO;
    const to = containerWidth;
    const x = Math.random() * (to - from) + from;

    return new PIXI.Point(x, 0);
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
      maxDropsAmount:
        (containerWidth * containerHeight) / CONST_PIXELS_PER_DROP,
      currentDropsSpeed: CONST_DROPS_SPEED,
    });

    this.state.app.renderer.backgroundColor = this.state.backgroundColor;

    if (CONST_USE_PIXELLATION) {
      this.state.app.stage.filters = [
        new PixelateFilter(CONST_PIXELLATION_SIZE),
      ];
    }

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
    const { app, maxDropsAmount } = this.state;
    const drops = Array(Math.round(maxDropsAmount * 0.01))
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
    const { app, drops, maxDropsAmount, currentDropsSpeed } = this.state;

    if (
      drops.length < maxDropsAmount &&
      Math.random() < CONST_DROPS_ADDING_CHANCE &&
      currentDropsSpeed > 0
    ) {
      const newDrop = this.createDrop();
      app.stage.addChild(newDrop.graphics);

      drops.push(newDrop);
      this.setState({ drops });
    }

    for (const drop of drops) {
      drop.x += currentDropsSpeed;
      drop.y += currentDropsSpeed * CONST_DROP_SIDES_RATIO;

      if (this.isDropOutOfView(drop)) {
        const { x, y } = this.randomStartingPoint;
        drop.x = x;
        drop.y = y;
      }

      drop.graphics.x = drop.x;
      drop.graphics.y = drop.y;
    }
  };

  updateSpeed = (): void => {
    const { isMouseDown, currentDropsSpeed } = this.state;
    if (isMouseDown) {
      this.setState({
        currentDropsSpeed: Math.max(currentDropsSpeed - CONST_SPEED_DELTA, 0),
      });
    } else if (currentDropsSpeed !== CONST_DROPS_SPEED) {
      this.setState({
        currentDropsSpeed: CONST_DROPS_SPEED,
      });
    }
  };
}
