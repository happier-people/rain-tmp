export type SchemeId = string;

export type NormalizedSchemeField<T> = { [id in SchemeId]: T };

export class NormalizedScheme<T> {
  constructor(public byId: NormalizedSchemeField<T>, public all: SchemeId[]) {}
}
