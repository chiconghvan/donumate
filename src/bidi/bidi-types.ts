export type BidiSuccess<T = unknown> = {
  type: 'success';
  id: number;
  result: T;
};

export type BidiError = {
  type: 'error';
  id: number;
  error: string;
  message?: string;
  stacktrace?: string;
};

export type BidiResponse<T = unknown> = BidiSuccess<T> | BidiError;

export type RemoteValue = {
  type: string;
  value?: unknown;
  internalId?: string;
};

export type BrowsingContextInfo = {
  context: string;
  url: string;
  children?: BrowsingContextInfo[] | null;
};

export type BrowsingContextTree = {
  contexts: BrowsingContextInfo[];
};

export type ScriptEvaluateResult = {
  realm?: string;
  result: RemoteValue;
};
