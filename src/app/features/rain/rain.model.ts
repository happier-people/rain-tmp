import * as PIXI from 'pixi.js';
import { NormalizedScheme } from '@app/services/data-nomalizer/data-nomalizer.model';

export interface RainState {
  app: PIXI.Application;
  loader: PIXI.Loader;

  containerWidth: number;
  containerHeight: number;

  spritePaths: NormalizedScheme<string>;
  sprites: NormalizedScheme<PIXI.Sprite>;

  spriteLoading: string;
  spritesLoadingProgress: number;

  backgroundColor: number;

  isStageSetup: boolean;
  isMouseDown: boolean;

  drops: RainDrop[];
  maxDropsAmount: number;

  currentDropsSpeed: number;
}

export const rainInitialState: RainState = {
  app: null,
  loader: null,
  containerWidth: 0,
  containerHeight: 0,
  spritePaths: {
    all: [],
    byId: {},
  },
  sprites: {
    all: [],
    byId: {},
  },
  spriteLoading: null,
  spritesLoadingProgress: 0,
  backgroundColor: 0x000000,
  isStageSetup: false,
  isMouseDown: false,
  drops: [],
  maxDropsAmount: 0,
  currentDropsSpeed: 0,
};

export interface RainInitDto {
  container: HTMLElement;
  containerWidth: number;
  containerHeight: number;
}

export class RainDrop {
  x: number;
  y: number;
  length: number;
  graphics: PIXI.Graphics;
}

export const CONST_DROP_WIDTH = 4;
export const CONST_DROP_COLOR = 0x59c1f5;
export const CONST_DROP_SIDES_RATIO = 4;

export const CONST_DROPS_ADDING_CHANCE = 1 / 20;
export const CONST_DROPS_SPEED = 4; // => 4
export const CONST_SPEED_DELTA = 0.01;

export const CONST_PIXELS_PER_DROP = 6000;

export const CONST_USE_PIXELLATION = true;
export const CONST_PIXELLATION_SIZE = new PIXI.Point(5, 5);
