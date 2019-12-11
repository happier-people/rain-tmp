export enum Characters {
  STELLA = 'Stella Hoshii',
  JILL = 'Julianne Stingray',
  DANA = 'Dana Zane',
  DOROTHY = 'Dorothy Haze',
  GIL = 'Gillian',
  ALMA = 'Alma Armas',
  ANNA = 'Anna Graem',
  SEI = 'Sei Asagiri',
  BETTY = 'Beatrice Albert',
  DEAL = 'Deal',
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
  [
    Characters.JILL,
    {
      assetPath: '/assets/sprites/sprite-jill.png',
      sprite: null,
    },
  ],
  [
    Characters.DANA,
    {
      assetPath: '/assets/sprites/sprite-dana.png',
      sprite: null,
    },
  ],
  [
    Characters.DOROTHY,
    {
      assetPath: '/assets/sprites/sprite-dorothy.png',
      sprite: null,
    },
  ],
  [
    Characters.GIL,
    {
      assetPath: '/assets/sprites/sprite-gil.png',
      sprite: null,
    },
  ],
  [
    Characters.ALMA,
    {
      assetPath: '/assets/sprites/sprite-alma.png',
      sprite: null,
    },
  ],
  [
    Characters.ANNA,
    {
      assetPath: '/assets/sprites/sprite-anna.png',
      sprite: null,
    },
  ],
  [
    Characters.SEI,
    {
      assetPath: '/assets/sprites/sprite-sei.png',
      sprite: null,
    },
  ],
  [
    Characters.BETTY,
    {
      assetPath: '/assets/sprites/sprite-betty.png',
      sprite: null,
    },
  ],
  [
    Characters.DEAL,
    {
      assetPath: '/assets/sprites/sprite-deal.png',
      sprite: null,
    },
  ],
]);

export const CHARACTER_ANIMATIONS: CharacterAnimation[] = [
  {
    character: Characters.STELLA,
    assetPath: '/assets/animations/animation-data-stella.json',
    animationName: 'sprite-stella-anim',
    animationSpeed: 0.05,
    sprite: null,
  },
  {
    character: Characters.JILL,
    assetPath: '/assets/animations/animation-data-jill.json',
    animationName: 'sprite-jill-anim',
    animationSpeed: 0.05,
    sprite: null,
  },
  {
    character: Characters.DANA,
    assetPath: '/assets/animations/animation-data-dana.json',
    animationName: 'sprite-dana-anim',
    animationSpeed: 0.05,
    sprite: null,
  },
  {
    character: Characters.ALMA,
    assetPath: '/assets/animations/animation-data-alma.json',
    animationName: 'sprite-alma-anim',
    animationSpeed: 0.05,
    sprite: null,
  },
  {
    character: Characters.ANNA,
    assetPath: '/assets/animations/animation-data-anna.json',
    animationName: 'sprite-anna-anim',
    animationSpeed: 0.05,
    sprite: null,
  },
];

export const FULL_ASSETS_LIST = [
  ...Array.from(CHARACTER_ASSETS.values()).map(({ assetPath }) => assetPath),
  ...CHARACTER_ANIMATIONS.map(({ assetPath }) => assetPath),
];

export const CONST_ANIMATION_CHANCE = 0.16;
