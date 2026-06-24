// Empty stub for exe builds - replaces react and react/jsx-runtime
export default {};
export function createElement() { return null; }
export function useState(init: unknown) { return [init, () => {}]; }
export function useMemo(fn: () => unknown) { return fn(); }
export const __SECRET_INTERNALS_DO_NOT_USE_OR_YOU_WILL_BE_FIRED = { ReactCurrentDispatcher: { current: {} } };
export const jsx = function() { return null; };
export const jsxs = function() { return null; };
export const Fragment = 'fragment';
