import { BehaviorSubject, Observable } from 'rxjs';
import { mapValues } from 'lodash';
import { environment } from 'src/environments/environment';

export type ReactiveState<S> = {
  [K in keyof S]: BehaviorSubject<S[K]>;
};

export type StreamState<S> = {
  [K in keyof S]: Observable<S[K]>;
};

export type StateUpdater<S> = (prevState: Readonly<S>) => Partial<S>;

export class StateService<S extends { [key: string]: any }> {
  private innerState$: ReactiveState<S>;
  private innerState: S;
  private initialState: S;
  state$: StreamState<S>;

  constructor(initialValues: S) {
    this.innerState$ = mapValues(
      initialValues,
      v => new BehaviorSubject(v)
    ) as ReactiveState<S>;
    this.state$ = mapValues(this.innerState$, s =>
      s.asObservable()
    ) as StreamState<S>;
    this.innerState = initialValues;
    this.initialState = initialValues;
  }

  get state(): S {
    return this.innerState;
  }

  setState(state: StateUpdater<S> | Partial<S>): void {
    let nextState: Partial<S>;
    if (typeof state === 'function') {
      nextState = (state as StateUpdater<S>)(this.state);
    } else {
      nextState = state;
    }

    this.logPrevState(this.constructor.name);

    Object.entries(nextState).forEach(([key, value]) =>
      this.innerState$[key].next(value)
    );

    this.innerState = this.getState();

    this.logNextState(nextState);
  }

  resetState = (state: Partial<S> = this.initialState): void => {
    this.setState(state);
  };

  private getState = () => mapValues(this.innerState$, s => s.getValue()) as S;

  private logPrevState = (className: string) => {
    if (environment.logState) {
      console.groupCollapsed(`%c ${className} state changed`, 'color: blue;');
      // tslint:disable-next-line: no-console
      console.log('%c prev state', 'color: red;', this.state);
    }
  };

  private logNextState = (nextState: Partial<S>) => {
    if (environment.logState) {
      const changedFields = Object.keys(nextState).join(',');
      // tslint:disable-next-line: no-console
      console.log('%c next state', 'color: green;', this.state);
      // tslint:disable-next-line: no-console
      console.log('%c changed fields', 'color: blue;', changedFields);

      console.groupEnd();
    }
  };
}
