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
  LightningStates,
  CONST_LIGHTNING_ALPHA_DELTAS,
  CONST_LIGHTNING_CHANCE,
  CONST_LIGHTNING_SEGMENTS,
} from './rain.model';
import { Injectable, Inject } from '@angular/core';
import { PixelateFilter } from '@pixi/filter-pixelate';
import * as PIXI from 'pixi.js';
import { CHANCE } from '@app/shared/providers/chance.provider';
import { Colors } from '@app/utils/colors.util';

@Injectable()
export class RainService extends StateService<RainState> {
  constructor(@Inject(CHANCE) private chance: Chance.Chance) {
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

  private static normalizeAlpha = (alpha: number): number => {
    if (alpha > 1) {
      return 1;
    }
    if (alpha < 0) {
      return 0;
    }
    return alpha;
  };

  private modifyGraphicsForLightning = (
    ctx: PIXI.Graphics,
    startX: number,
    startY: number,
    segments: number,
    boltWidth: number,
    isBranch: boolean
  ): PIXI.Graphics => {
    const { containerWidth, containerHeight } = this.state;
    let x = startX;
    let y = startY;

    if (!isBranch) {
      ctx.clear();
    }

    for (let i = 0; i < segments; i++) {
      ctx.lineStyle(boltWidth, 0xffffff);
      ctx.moveTo(x, y);

      if (isBranch) {
        x += this.chance.integer({ min: -30, max: 30 });
      } else {
        x += this.chance.integer({ min: -50, max: 50 });
      }
      if (x <= 10) {
        x = 10;
      }
      if (x >= containerWidth - 10) {
        x = containerWidth - 10;
      }

      if (isBranch) {
        y += this.chance.integer({ min: 10, max: 20 });
      } else {
        y += this.chance.integer({
          min: 20,
          max: (containerHeight * 1.2) / segments,
        });
      }
      if ((!isBranch && i === segments - 1) || y > containerHeight) {
        y = containerHeight;
      }

      ctx.lineTo(x, y);

      if (y >= containerHeight) {
        break;
      }

      if (!isBranch) {
        if (this.chance.d100() <= 20) {
          this.modifyGraphicsForLightning(ctx, x, y, 10, 1, true);
        }
      }
    }

    return ctx;
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
      lightningGraphics: new PIXI.Graphics(),
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
    const { app, maxDropsAmount, lightningGraphics } = this.state;
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

    app.stage.addChild(lightningGraphics);
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

  updateLightning = (): void => {
    const {
      lightningState,
      lightningGraphics,
      containerWidth,
      containerHeight,
      app,
    } = this.state;

    if (lightningState === LightningStates.VOID) {
      const outcome = this.chance.floating({ min: 0, max: 100 });
      if (outcome < CONST_LIGHTNING_CHANCE) {
        const newLightningGraphics = this.modifyGraphicsForLightning(
          lightningGraphics,
          this.chance.integer({
            min: containerWidth * 0.3,
            max: containerWidth * 0.7,
          }),
          -containerHeight * 0.2,
          CONST_LIGHTNING_SEGMENTS,
          3,
          false
        );
        this.setState({
          lightningGraphics: newLightningGraphics,
          lightningState: LightningStates.FADE_OUT_1,
        });
      }

      if (app.renderer.backgroundColor !== 0x000000) {
        app.renderer.backgroundColor = 0x000000;
      }

      return;
    }

    const nextAlpha = RainService.normalizeAlpha(
      lightningGraphics.alpha + CONST_LIGHTNING_ALPHA_DELTAS.get(lightningState)
    );
    lightningGraphics.alpha = nextAlpha;

    app.renderer.backgroundColor = Colors.colorWithOpacity(
      '000000',
      1 - nextAlpha / 4
    );

    if (
      lightningState === LightningStates.FADE_OUT_1 &&
      lightningGraphics.alpha < 0.5
    ) {
      this.setState({
        lightningState: LightningStates.FADE_IN_1,
      });
      return;
    }

    if (
      lightningState === LightningStates.FADE_IN_1 &&
      lightningGraphics.alpha === 1
    ) {
      this.setState({
        lightningState: LightningStates.FADE_OUT_2,
      });
      return;
    }

    if (
      lightningState === LightningStates.FADE_OUT_2 &&
      lightningGraphics.alpha < 0.5
    ) {
      this.setState({
        lightningState: LightningStates.FADE_IN_2,
      });
      return;
    }

    if (
      lightningState === LightningStates.FADE_IN_2 &&
      lightningGraphics.alpha === 1
    ) {
      this.setState({
        lightningState: LightningStates.FADE_OUT_3,
      });
      return;
    }

    if (
      lightningState === LightningStates.FADE_OUT_3 &&
      lightningGraphics.alpha === 0
    ) {
      this.setState({
        lightningState: LightningStates.VOID,
      });
      return;
    }
  };
}
