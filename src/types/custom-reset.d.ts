
declare global {
  interface ObjectConstructor {
    entries<T extends Record<PropertyKey, unknown>>(
      obj: T
    ): Array<[keyof T, T[keyof T]]>;
    
    entries<T>(
      obj: { [s: string]: T } | ArrayLike<T>
    ): Array<[string, T]>;
    
    entries(obj: object): Array<[string, unknown]>;
  }
}

export {};