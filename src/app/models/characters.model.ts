export enum Characters {
  STELLA = 'Stella Hoshii',
}

export interface CharacterAsset {
  assetPath: string;
  sprite: PIXI.Sprite;
}

export interface CharacterAnimation {
  assetPath: string;
  animationName: string;
  animationSpeed: number;
  sprite: PIXI.AnimatedSprite;
  character: Characters;
}

export const CONST_CHARACTER_ASSET_X = 256;
export const CONST_CHARACTER_ASSET_Y = 256;

export const CHARACTER_ASSETS = new Map<Characters, CharacterAsset>([
  [
    Characters.STELLA,
    {
      assetPath: '/assets/sprites/sprite-stella.png',
      sprite: null,
    },
  ],
]);

export const CHARACTER_ANIMATIONS: CharacterAnimation[] = [
  {
    character: Characters.STELLA,
    assetPath: '/assets/animations/stella-animation.json',
    animationName: 'sprite-stella-anim',
    animationSpeed: 0.05,
    sprite: null,
  },
];

export const FULL_ASSETS_LIST = [
  ...Array.from(CHARACTER_ASSETS.values()).map(({ assetPath }) => assetPath),
  ...CHARACTER_ANIMATIONS.map(({ assetPath }) => assetPath),
];

export const CONST_ANIMATION_CHANCE = 0.16;
