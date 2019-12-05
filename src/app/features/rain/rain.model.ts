import * as PIXI from 'pixi.js';
import { Range } from '@app/models/common.models';

export enum LightningStates {
  VOID = 'void',
  FADE_OUT_1 = 'fade-out-1',
  FADE_IN_1 = 'fade-in-1',
  FADE_OUT_2 = 'fade-out-2',
  FADE_IN_2 = 'fade-in-2',
  FADE_OUT_3 = 'fade-out-3',
}

export interface RainState {
  app: PIXI.Application;
  loader: PIXI.Loader;

  containerWidth: number;
  containerHeight: number;

  dropsContainer: PIXI.Container;
  lightningContainer: PIXI.Container;
  characterContainer: PIXI.Container;

  spriteLoading: string;
  spritesLoadingProgress: number;

  backgroundColor: number;

  isStageSetup: boolean;
  isMouseDown: boolean;

  drops: RainDrop[];
  maxDropsAmount: number;

  lightningGraphics: PIXI.Graphics;
  lightningState: LightningStates;

  currentDropsSpeed: number;

  currentCharacterIndex: number;
  characterSprites: PIXI.Sprite[];
}

export const rainInitialState: RainState = {
  app: null,
  loader: null,
  containerWidth: 0,
  containerHeight: 0,
  dropsContainer: null,
  lightningContainer: null,
  characterContainer: null,
  spriteLoading: null,
  spritesLoadingProgress: 0,
  backgroundColor: 0x000000,
  isStageSetup: false,
  isMouseDown: false,
  drops: [],
  lightningGraphics: null,
  lightningState: LightningStates.VOID,
  maxDropsAmount: 0,
  currentDropsSpeed: 0,
  currentCharacterIndex: 0,
  characterSprites: [],
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
export const CONST_DROP_LENGTH_RANGE: Range = { min: 20, max: 40 };

export const CONST_DROPS_ADDING_CHANCE = 1 / 20;
export const CONST_DROPS_SPEED = 4; // => 4
export const CONST_SPEED_DELTA = 0.01;

export const CONST_PIXELS_PER_DROP = 6000;

export const CONST_USE_PIXELLATION = true;
export const CONST_PIXELLATION_SIZE = new PIXI.Point(5, 5);

export const CONST_LIGHTNING_SEGMENTS = 50; // => should be scaling
export const CONST_LIGHTNING_BRANCH_SEGMENTS = 10;
export const CONST_LIGHTNING_CHANCE = 0.5; // => 0.16
export const CONST_LIGHTNING_COLOR = 0xffffff;

export const CONST_LIGHTNING_X_RANGE: Range = { min: -50, max: 50 };
export const CONST_LIGHTNING_BRANCH_X_RANGE: Range = { min: -30, max: 30 };
export const CONST_LIGHTNING_Y_RANGE: Range = { min: 20, max: 30 };
export const CONST_LIGHTNING_BRANCH_Y_RANGE: Range = { min: 10, max: 20 };
export const CONST_LIGHTNING_BORDER_BUFFER = 10;

export const CONST_LIGHTNING_TOP_OFFSET_COEFF = 0.2;
export const CONST_LIGHTNING_POSITION_RANGE: Range = { min: 0.3, max: 0.7 };

export const CONST_LIGHTNING_WIDTH = 3;
export const CONST_LIGHTNING_BRANCH_WIDTH = 1;

export const CONST_LIGHTNING_ALPHA_DELTAS = new Map<LightningStates, number>([
  [LightningStates.FADE_OUT_1, -0.04], // => -0.08
  [LightningStates.FADE_IN_1, 0.04], // => 0.08
  [LightningStates.FADE_OUT_2, -0.04], // => -0.08
  [LightningStates.FADE_IN_2, 0.04], // => 0.08
  [LightningStates.FADE_OUT_3, -0.015], // => -0.03
]);

export const CHARACTER_ASSET_STELLA = '/assets/sprites/sprite-stella.png';

export const CONST_CHARACTER_ASSETS = [CHARACTER_ASSET_STELLA];

export const CONST_CHARACTER_ASSET_X = 256;
export const CONST_CHARACTER_ASSET_Y = 256;
