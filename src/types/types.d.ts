
declare global {
  interface KonzolOptions {
    functionName?: string;
    /**
     * The entry point in which global helpers are defined.
     */
    entry: string;
  }
}

export {}