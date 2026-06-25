export type ListPickerOption<T extends string> = {
  label: string;
  value: T;
};

export type ListPickerArgs<T extends string> = {
  title: string;
  options: ListPickerOption<T>[];
  initialValue?: T;
  submitHint?: string;
  cancelHint?: string;
};

export type TextInputArgs = {
  title: string;
  defaultValue?: string;
  validate?: (value: string) => string | undefined;
};

export type UpdateInfo = {
  currentVersion: string;
  latestVersion: string;
  assetName: string;
  size: number;
  releaseUrl: string;
  downloadUrl: string;
};

export type UpdateChoice = 'install' | 'skip';

export interface UiProvider {
  runListPicker<T extends string>(args: ListPickerArgs<T>): Promise<T | undefined>;
  runTextInputPrompt(args: TextInputArgs): Promise<string | undefined>;
  runUpdatePrompt(update: UpdateInfo): Promise<UpdateChoice | undefined>;
}
