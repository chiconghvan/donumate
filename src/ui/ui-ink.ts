import type { UiProvider, ListPickerArgs, TextInputArgs, UpdateInfo, UpdateChoice, FlowScriptEditorArgs } from './ui-types.js';
import { runListPicker as inkRunListPicker, type ListPickerOption } from './list-picker.js';
import { runTextInputPrompt as inkRunTextInputPrompt } from './text-input-prompt.js';
import { runUpdatePrompt as inkRunUpdatePrompt } from './update-prompt.js';
import { runFlowScriptEditor as inkRunFlowScriptEditor } from './flow-script-editor.js';

export const inkUi: UiProvider = {
  async runListPicker<T extends string>(args: ListPickerArgs<T>): Promise<T | undefined> {
    return inkRunListPicker(args);
  },

  async runTextInputPrompt(args: TextInputArgs): Promise<string | undefined> {
    return inkRunTextInputPrompt(args);
  },

  async runUpdatePrompt(update: UpdateInfo): Promise<UpdateChoice | undefined> {
    return inkRunUpdatePrompt(update);
  },

  async runFlowScriptEditor(args: FlowScriptEditorArgs): Promise<string | undefined> {
    return inkRunFlowScriptEditor(args);
  },
};
