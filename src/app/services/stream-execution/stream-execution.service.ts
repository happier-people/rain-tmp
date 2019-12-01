import { Injectable, InjectionToken, Inject, Optional } from '@angular/core';
import { Subscription, Observable, PartialObserver } from 'rxjs';
import { NormalizedSchemeField } from '../data-nomalizer/data-nomalizer.model';

export interface PreExecution {
  pre: () => void;
}

export const STREAM_EXECUTION_TOKEN = new InjectionToken<string>(
  'StreamSubscriptionToken'
);

@Injectable()
export class StreamExecutionService {
  static readonly defaultToken = 'SUBSCRIPTIONS';
  private subscriptions: NormalizedSchemeField<Subscription> = {};

  private get subToken() {
    return this.token || StreamExecutionService.defaultToken;
  }

  constructor(
    @Optional() @Inject(STREAM_EXECUTION_TOKEN) private token: string
  ) {}

  private init = () => {
    if (!this.subscriptions[this.subToken]) {
      this.subscriptions[this.subToken] = new Subscription();
    }
  };

  add = (sub: Subscription) => {
    this.init();
    this.subscriptions[this.subToken].add(sub);
  };

  unsubscribe = () => {
    if (this.subscriptions[this.subToken]) {
      this.subscriptions[this.subToken].unsubscribe();
      this.subscriptions[this.subToken] = null;
    }
  };

  execute = <T>(
    stream: Observable<T>,
    observer?: PartialObserver<T> | PreExecution
  ) => {
    if (observer && (observer as PreExecution).pre) {
      (observer as PreExecution).pre();
    }
    this.add(stream.subscribe(observer as PartialObserver<T>));
  };
}
