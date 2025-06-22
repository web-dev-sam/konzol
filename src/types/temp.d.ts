
declare global {
  function $log(...args: any[]): void;
  function log(...args: any[]): void;
  function $format(format: string, ...args: any[]): string;
}

export {}