/**
 * Global abort mechanism for Ctrl+C (SIGINT) handling.
 *
 * First SIGINT: abort all pending operations (fetch, sleep, BiDi, WebSocket).
 * Second SIGINT during cleanup: force exit.
 */

export const globalAbort = new AbortController();

/**
 * Set while runner.ts is executing its finally block (cleanup).
 * Second SIGINT while true => force exit.
 */
let _cleaningUp = false;

export function setCleaningUp(value: boolean): void {
  _cleaningUp = value;
}

export function isCleaningUp(): boolean {
  return _cleaningUp;
}

let _initialized = false;

/** Call once from cli.ts entry point. */
export function initAbortHandler(): void {
  if (_initialized) return;
  _initialized = true;
  process.on('SIGINT', () => {
    if (_cleaningUp) {
      process.exit(130);
    }
    _cleaningUp = true;
    globalAbort.abort();
  });
}
