import { Injectable } from '@angular/core';
import { schema, normalize } from 'normalizr';
import { NormalizedScheme, SchemeId } from './data-nomalizer.model';
import { omit } from 'lodash';

@Injectable()
export class DataNormalizerService {
  static readonly getCommonEntitySchema = (id = 'id') =>
    new schema.Entity(
      'byId',
      {},
      {
        idAttribute: id,
      }
    );

  normalize = <T>(
    entities: T[],
    scheme = DataNormalizerService.getCommonEntitySchema()
  ): NormalizedScheme<T> => {
    const {
      result,
      entities: { byId },
    } = normalize(entities, [scheme]);

    return {
      all: result,
      byId,
    };
  };

  get custom() {
    return normalize;
  }

  removeEnitityById = <T extends NormalizedScheme<P>, P>(
    id: SchemeId,
    entity: T
  ): T =>
    ({
      all: entity.all.filter(i => i !== id),
      byId: omit(entity.byId, id),
    } as T);
}
