export interface ClickEvent {
  target: HTMLElement | null;
}

export type ClickHandler = (event: ClickEvent) => void;

export interface ChangeEvent<T> {
  value: T;
}

export type ChangeHandler<T> = (event: ChangeEvent<T>) => void;

export interface InputEvent {
  value: string;
}

export type InputHandler = (event: InputEvent) => void;

export interface TouchEvent {
  touches: Touch[];
  changedTouches: Touch[];
  target: HTMLElement | null;
}

export type TouchHandler = (event: TouchEvent) => void;