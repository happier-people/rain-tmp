import { StateService } from '@app/services/state/state.service';
import {
  RainState,
  rainInitialState,
  RainInitDto,
  CONST_DROP_WIDTH,
  CONST_DROP_COLOR,
  CONST_DROP_SIDES_RATIO,
  RainDrop,
  CONST_DROPS_SPEED_RANGE,
  CONST_DROPS_ADDING_CHANCE,
  CONST_PIXELS_PER_DROP,
  CONST_USE_PIXELLATION,
  CONST_PIXELLATION_SIZE,
  CONST_DROPS_SPEED_DELTA,
  LightningStates,
  CONST_LIGHTNING_ALPHA_DELTAS,
  CONST_LIGHTNING_CHANCE,
  CONST_LIGHTNING_SEGMENTS,
  CONST_LIGHTNING_COLOR,
  CONST_LIGHTNING_X_RANGE,
  CONST_LIGHTNING_BRANCH_X_RANGE,
  CONST_LIGHTNING_BORDER_BUFFER,
  CONST_LIGHTNING_BRANCH_SEGMENTS,
  CONST_DROP_LENGTH_RANGE,
  CONST_LIGHTNING_BRANCH_Y_RANGE,
  CONST_LIGHTNING_Y_RANGE,
  CONST_LIGHTNING_TOP_OFFSET_COEFF,
  CONST_LIGHTNING_WIDTH,
  CONST_LIGHTNING_BRANCH_WIDTH,
  CONST_LIGHTNING_POSITION_RANGE,
  CONST_LIGHTNING_SPEED_RANGE,
  CONST_LIGHTNING_SPEED_DELTA,
  CONST_FAR_DROP_WIDTH,
  CONST_FAR_DROP_COLOR,
  CONST_FAR_DROP_SIDES_RATIO,
  CONST_DROPS_STARTING_RATIO,
  CONST_FAR_DROPS_AMOUNT_RATIO,
  CONST_FAR_DROPS_SPEED_RANGE,
  CONST_FAR_DROPS_SPEED_DELTA,
} from './rain.model';
import { Injectable, Inject } from '@angular/core';
import { PixelateFilter } from '@pixi/filter-pixelate';
import * as PIXI from 'pixi.js';
import { CHANCE } from '@app/shared/providers/chance.provider';
import { Colors } from '@app/utils/colors.util';
import {
  CHARACTER_ASSETS,
  FULL_ASSETS_LIST,
  CONST_CHARACTER_ASSET_X,
  CONST_CHARACTER_ASSET_Y,
  CHARACTER_ANIMATIONS,
  Characters,
  CONST_ANIMATION_CHANCE,
} from '@app/models/characters.model';

@Injectable()
export class RainService extends StateService<RainState> {
  constructor(@Inject(CHANCE) private chance: Chance.Chance) {
    super(rainInitialState);
  }

  private static getGraphicsForDrop = (drop: RainDrop): PIXI.Graphics => {
    const line = new PIXI.Graphics();

    const width = drop.isFar ? CONST_FAR_DROP_WIDTH : CONST_DROP_WIDTH;
    const color = drop.isFar ? CONST_FAR_DROP_COLOR : CONST_DROP_COLOR;
    const sidesRatio = drop.isFar
      ? CONST_FAR_DROP_SIDES_RATIO
      : CONST_DROP_SIDES_RATIO;

    line.lineStyle(width, color);

    const lineA = drop.length / Math.sqrt(Math.pow(sidesRatio, 2) + 1);
    const lineB = lineA * sidesRatio;
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
      ctx.lineStyle(boltWidth, CONST_LIGHTNING_COLOR);
      ctx.moveTo(x, y);

      if (isBranch) {
        x += this.chance.integer(CONST_LIGHTNING_BRANCH_X_RANGE);
      } else {
        x += this.chance.integer(CONST_LIGHTNING_X_RANGE);
      }
      if (x <= CONST_LIGHTNING_BORDER_BUFFER) {
        x = CONST_LIGHTNING_BORDER_BUFFER;
      }
      if (x >= containerWidth - CONST_LIGHTNING_BORDER_BUFFER) {
        x = containerWidth - CONST_LIGHTNING_BORDER_BUFFER;
      }

      if (isBranch) {
        y += this.chance.integer(CONST_LIGHTNING_BRANCH_Y_RANGE);
      } else {
        y += this.chance.integer({
          min: CONST_LIGHTNING_Y_RANGE.min,
          max: Math.max(
            (containerHeight * (1 + CONST_LIGHTNING_TOP_OFFSET_COEFF)) /
              segments,
            CONST_LIGHTNING_Y_RANGE.max
          ),
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
          this.modifyGraphicsForLightning(
            ctx,
            x,
            y,
            CONST_LIGHTNING_BRANCH_SEGMENTS,
            CONST_LIGHTNING_BRANCH_WIDTH,
            true
          );
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
    const min = -containerHeight / CONST_DROP_SIDES_RATIO;
    const max = containerWidth;
    const x = this.chance.integer({ min, max });

    return new PIXI.Point(x, 0);
  }

  private createDrop = (isFar: boolean): RainDrop => {
    const drop = new RainDrop();
    const { x, y } = this.randomStartingPoint;

    drop.x = x;
    drop.y = y;
    drop.length = this.chance.integer(CONST_DROP_LENGTH_RANGE);
    drop.isFar = isFar;

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

      dropsContainer: new PIXI.Container(),
      farDropsContainer: new PIXI.Container(),
      lightningContainer: new PIXI.Container(),
      characterContainer: new PIXI.Container(),

      maxDropsAmount:
        (containerWidth * containerHeight) / CONST_PIXELS_PER_DROP,
      currentDropsSpeed: CONST_DROPS_SPEED_RANGE.max,
      currentFarDropsSpeed: CONST_FAR_DROPS_SPEED_RANGE.max,

      currentLightningSpeed: CONST_LIGHTNING_SPEED_RANGE.max,
      lightningGraphics: new PIXI.Graphics(),

      characterAssets: CHARACTER_ASSETS,
      characterAnimations: CHARACTER_ANIMATIONS,
    });

    this.state.app.renderer.backgroundColor = this.state.backgroundColor;

    container.appendChild(this.state.app.view);

    this.state.loader
      .add(FULL_ASSETS_LIST)
      .on('progress', this.handleLoadProgress.bind(this))
      .load(this.setupScenes.bind(this));
  };

  resizeContainer = (width: number, height: number): void => {
    const { app, characterAssets, characterAnimations } = this.state;
    app.renderer.resize(width, height);

    this.setState({
      containerWidth: width,
      containerHeight: height,
    });

    characterAssets.forEach(asset => {
      this.setupSprite(asset.sprite);
    });

    for (const animation of characterAnimations) {
      this.setupSprite(animation.sprite);
    }
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

  private setupSprite = (sprite: PIXI.Sprite): void => {
    const { containerWidth, containerHeight } = this.state;
    const xScalingCoeff = containerWidth > 500 ? 3 : 2;
    const yScalingCoeff = xScalingCoeff;

    sprite.x = Math.round(
      containerWidth / 2 - (CONST_CHARACTER_ASSET_X * xScalingCoeff) / 2
    );
    sprite.y = Math.round(
      containerHeight - CONST_CHARACTER_ASSET_Y * yScalingCoeff
    );

    sprite.scale.x = xScalingCoeff;
    sprite.scale.y = yScalingCoeff;
  };

  private setupScenes = (): void => {
    const {
      app,
      maxDropsAmount,
      lightningGraphics,
      loader,
      dropsContainer,
      farDropsContainer,
      lightningContainer,
      characterContainer,
      characterAssets,
      characterAnimations,
    } = this.state;

    const drops = Array(Math.round(maxDropsAmount * CONST_DROPS_STARTING_RATIO))
      .fill(null)
      .map(() => this.createDrop(false));
    const farDrops = Array(
      Math.round(maxDropsAmount * CONST_DROPS_STARTING_RATIO)
    )
      .fill(null)
      .map(() => this.createDrop(true));

    for (const drop of drops) {
      dropsContainer.addChild(drop.graphics);
    }
    for (const drop of farDrops) {
      farDropsContainer.addChild(drop.graphics);
    }

    lightningContainer.addChild(lightningGraphics);

    characterAssets.forEach((asset, character) => {
      const sprite = new PIXI.Sprite(loader.resources[asset.assetPath].texture);
      this.setupSprite(sprite);

      sprite.visible = false;
      characterContainer.addChild(sprite);

      characterAssets.set(character, {
        ...asset,
        sprite,
      });
    });

    const currentCharacter = this.chance.pickone(Object.values(Characters));
    characterAssets.get(currentCharacter).sprite.visible = true;

    for (const animation of characterAnimations) {
      const sheet = loader.resources[animation.assetPath].spritesheet;
      const sprite = new PIXI.AnimatedSprite(
        sheet.animations[animation.animationName]
      );
      this.setupSprite(sprite);

      sprite.animationSpeed = animation.animationSpeed;
      sprite.loop = false;
      sprite.onComplete = this.onAnimationComplete.bind(this);

      characterContainer.addChild(sprite);
      animation.sprite = sprite;
    }

    [
      lightningContainer,
      farDropsContainer,
      characterContainer,
      dropsContainer,
    ].forEach(container => {
      if (CONST_USE_PIXELLATION) {
        container.filters = [new PixelateFilter(CONST_PIXELLATION_SIZE)];
      }
      app.stage.addChild(container);
    });

    this.setState({
      drops,
      farDrops,
      currentCharacter,
      characterAssets,
      characterAnimations,
      isStageSetup: true,
    });
  };

  updateDrops = (): void => {
    const {
      drops,
      farDrops,
      maxDropsAmount,
      currentDropsSpeed,
      currentFarDropsSpeed,
      dropsContainer,
      farDropsContainer,
    } = this.state;

    if (
      drops.length < maxDropsAmount * (1 - CONST_FAR_DROPS_AMOUNT_RATIO) &&
      Math.random() < CONST_DROPS_ADDING_CHANCE &&
      currentDropsSpeed > 0
    ) {
      const newDrop = this.createDrop(false);
      dropsContainer.addChild(newDrop.graphics);

      drops.push(newDrop);
      this.setState({ drops });
    }

    if (
      farDrops.length < maxDropsAmount * CONST_FAR_DROPS_AMOUNT_RATIO &&
      Math.random() < CONST_DROPS_ADDING_CHANCE &&
      currentFarDropsSpeed > 0
    ) {
      const newDrop = this.createDrop(true);
      farDropsContainer.addChild(newDrop.graphics);

      farDrops.push(newDrop);
      this.setState({ farDrops });
    }

    for (const drop of drops.concat(farDrops)) {
      const speed = drop.isFar ? currentFarDropsSpeed : currentDropsSpeed;
      drop.x += speed;
      drop.y += speed * CONST_DROP_SIDES_RATIO;

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
    const {
      isMouseDown,
      currentDropsSpeed,
      currentFarDropsSpeed,
      currentLightningSpeed,
    } = this.state;
    if (isMouseDown) {
      this.setState({
        currentDropsSpeed: Math.max(
          currentDropsSpeed - CONST_DROPS_SPEED_DELTA,
          CONST_DROPS_SPEED_RANGE.min
        ),
        currentFarDropsSpeed: Math.max(
          currentFarDropsSpeed - CONST_FAR_DROPS_SPEED_DELTA,
          CONST_FAR_DROPS_SPEED_RANGE.min
        ),
        currentLightningSpeed: Math.max(
          currentLightningSpeed - CONST_LIGHTNING_SPEED_DELTA,
          CONST_LIGHTNING_SPEED_RANGE.min
        ),
      });
    } else {
      if (currentDropsSpeed !== CONST_DROPS_SPEED_RANGE.max) {
        this.setState({
          currentDropsSpeed: CONST_DROPS_SPEED_RANGE.max,
        });
      }
      if (currentFarDropsSpeed !== CONST_FAR_DROPS_SPEED_RANGE.max) {
        this.setState({
          currentFarDropsSpeed: CONST_FAR_DROPS_SPEED_RANGE.max,
        });
      }
      if (currentLightningSpeed !== CONST_LIGHTNING_SPEED_RANGE.max) {
        this.setState({
          currentLightningSpeed: CONST_LIGHTNING_SPEED_RANGE.max,
        });
      }
    }
  };

  updateLightning = (): void => {
    const {
      lightningState,
      lightningGraphics,
      containerWidth,
      containerHeight,
      app,
      currentLightningSpeed,
    } = this.state;

    if (lightningState === LightningStates.VOID) {
      const outcome = this.chance.floating({ min: 0, max: 100 });
      if (outcome < CONST_LIGHTNING_CHANCE) {
        const newLightningGraphics = this.modifyGraphicsForLightning(
          lightningGraphics,
          this.chance.integer({
            min: containerWidth * CONST_LIGHTNING_POSITION_RANGE.min,
            max: containerWidth * CONST_LIGHTNING_POSITION_RANGE.max,
          }),
          -containerHeight * CONST_LIGHTNING_TOP_OFFSET_COEFF,
          CONST_LIGHTNING_SEGMENTS,
          CONST_LIGHTNING_WIDTH,
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
      lightningGraphics.alpha +
        CONST_LIGHTNING_ALPHA_DELTAS.get(lightningState) * currentLightningSpeed
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

  private onAnimationComplete = (): void => {
    const {
      currentCharacter,
      characterAssets,
      characterAnimations,
      currentAnimationIndex,
    } = this.state;

    const currentAsset = characterAssets.get(currentCharacter);
    const currentCharacterAnimations = characterAnimations.filter(
      ({ character }) => character === currentCharacter
    );

    const currentAnimation = currentCharacterAnimations[currentAnimationIndex];

    currentAnimation.sprite.visible = false;
    currentAsset.sprite.visible = true;

    this.setState({
      isCharacterAnimationInProgress: false,
    });
  };

  updateCharacter = (): void => {
    const {
      currentCharacter,
      characterAssets,
      characterAnimations,
      isCharacterAnimationInProgress,
    } = this.state;

    const currentAsset = characterAssets.get(currentCharacter);
    const currentCharacterAnimations = characterAnimations.filter(
      ({ character }) => character === currentCharacter
    );

    const hasAnimations = !!currentCharacterAnimations.length;

    if (hasAnimations && !isCharacterAnimationInProgress) {
      const outcome = this.chance.floating({ min: 0, max: 100 });
      if (outcome < CONST_ANIMATION_CHANCE) {
        const currentAnimationIndex = this.chance.integer({
          min: 0,
          max: currentCharacterAnimations.length - 1,
        });
        const currentAnimation =
          currentCharacterAnimations[currentAnimationIndex];

        currentAnimation.sprite.visible = true;
        currentAsset.sprite.visible = false;

        currentAnimation.sprite.gotoAndPlay(0);

        this.setState({
          currentAnimationIndex,
          isCharacterAnimationInProgress: true,
        });
      }
    }
  };
}
