/// <reference types="vitest" />

declare const process: {
  on(event: 'unhandledRejection', listener: (reason: unknown) => void): void;
};

process.on('unhandledRejection', (reason: unknown) => {
  if (reason instanceof Error) {
    return;
  }
});

export {};
