// Empty stub for exe builds - replaces ink
export default {};
export function Box() { return null; }
export function Text() { return null; }
export function useInput() {}
export function render() {
  return { clear() {}, unmount() {}, waitUntilExit() { return Promise.resolve(); } };
}
