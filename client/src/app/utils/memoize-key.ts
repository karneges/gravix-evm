export const memoizeKey = (...args: any[]): string => args.map(a => `${a}`).join('-')
