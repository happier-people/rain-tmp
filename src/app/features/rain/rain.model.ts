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
  drops: RainDrop[];
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
  drops: [],
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
export const CONST_DROP_COLOR = 0xeeeeee;
export const CONST_DROP_SIDES_RATIO = 4;

export const CONST_DROPS_AMOUNT = 300;
export const CONST_DROPS_ADDING_CHANCE = 1 / 20;
export const CONST_DROPS_SPEED = 1.5;
