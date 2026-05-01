export type ImageSource = string;

export type FontSource = string;

export type LoadingState = 'idle' | 'loading' | 'loaded' | 'error';

export interface ResourceState<T> {
  status: LoadingState;
  data?: T;
  error?: Error;
}