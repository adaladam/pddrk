interface IIniitial {
  readonly state: 'init';
}

interface ILoading {
  readonly state: 'loading';
}

interface ISuccess<T> {
  readonly state: 'success';
  readonly data: T;
}

interface IFailure {
  readonly state: 'failure';
  readonly error: Error;
}

export type Loadable<T> = IIniitial | ILoading | ISuccess<T> | IFailure;
