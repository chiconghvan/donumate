import React from 'react';
import { render } from 'ink';

export type InkPromptProps<T> = {
  onSubmit: (value: T) => void;
  onCancel: () => void;
};

export async function runInkPrompt<T>(renderPrompt: (props: InkPromptProps<T>) => React.ReactElement): Promise<T | undefined> {
  return new Promise<T | undefined>((resolve) => {
    let app: ReturnType<typeof render> | undefined;
    let settled = false;

    const settle = (value: T | undefined) => {
      if (settled) return;
      settled = true;
      app?.clear();
      app?.unmount();
      resolve(value);
    };

    app = render(renderPrompt({
      onSubmit: (value) => settle(value),
      onCancel: () => settle(undefined),
    }));
  });
}
