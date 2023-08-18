export const isValid = (val: any) =>
  val !== undefined && val !== null && val !== '';

export const isString = (val: unknown): val is string =>
  typeof val === 'string';

export const isAllValid = (vals: any[]) => vals.every(isValid);