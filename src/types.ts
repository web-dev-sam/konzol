export interface Options {
  /**
   * The name of the macro. Defaults to `log!`.
   * If youre using JS, you can't use `!` in the name.
   * In that case, use `log` or something similar.
   */
  macroName?: string
}
