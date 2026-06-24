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
  sharedId?: string;
};

export type BrowsingContextInfo = {
  context: string;
  url: string;
  children?: BrowsingContextInfo[] | null;
};

export type BrowsingContextTree = {
  contexts: BrowsingContextInfo[];
};

export type BrowsingContextCreateResult = {
  context: string;
};

export type ScriptEvaluateResult = {
  realm?: string;
  result: RemoteValue;
};

export type BidiSharedReference = {
  sharedId: string;
};

export type BidiPointerMoveAction = {
  type: 'pointerMove';
  x: number;
  y: number;
  duration?: number;
  origin?: 'viewport';
};

export type BidiPointerButtonAction = {
  type: 'pointerDown' | 'pointerUp';
  button: number;
};

export type BidiPauseAction = {
  type: 'pause';
  duration?: number;
};

export type BidiPointerAction = BidiPointerMoveAction | BidiPointerButtonAction | BidiPauseAction;

export type BidiPointerSourceActions = {
  type: 'pointer';
  id: string;
  parameters: { pointerType: 'mouse' };
  actions: BidiPointerAction[];
};

export type BidiKeyAction = BidiPauseAction | {
  type: 'keyDown' | 'keyUp';
  value: string;
};

export type BidiKeySourceActions = {
  type: 'key';
  id: string;
  actions: BidiKeyAction[];
};

export type BidiInputSourceActions = BidiPointerSourceActions | BidiKeySourceActions;
