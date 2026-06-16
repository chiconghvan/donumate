export class AppError extends Error {
  constructor(message: string, public readonly cause?: unknown) {
    super(message);
    this.name = 'AppError';
  }
}

/** User pressed Esc or chose Back to go back one CLI step. Not a real error. */
export class CliBackError extends AppError {
  constructor(
    message = 'Back',
    public readonly state?: {
      inputsState?: { values: Record<string, string>; cursor: number };
      profileId?: string;
    }
  ) {
    super(message);
    this.name = 'CliBackError';
  }
}

export function isCliBackError(error: unknown): boolean {
  return error instanceof CliBackError;
}

export function formatError(error: unknown): string {
  if (error instanceof AppError && error.cause !== undefined) {
    const inner = error.cause instanceof Error ? formatError(error.cause) : String(error.cause);
    return `${error.message}\n  ${inner}`;
  }
  if (error instanceof Error) {
    return error.message;
  }
  return String(error);
}
