import type { UiProvider, ListPickerArgs, TextInputArgs } from './ui-types.js';
import { runListPicker as inkRunListPicker } from './list-picker.js';
import { runTextInputPrompt as inkRunTextInputPrompt } from './text-input-prompt.js';

export const inkUi: UiProvider = {
  async runListPicker<T extends string>(args: ListPickerArgs<T>): Promise<T | undefined> {
    return inkRunListPicker(args);
  },

  async runTextInputPrompt(args: TextInputArgs): Promise<string | undefined> {
    return inkRunTextInputPrompt(args);
  },
};
