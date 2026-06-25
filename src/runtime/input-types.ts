export type InputKind = 'input' | 'text' | 'number' | 'file' | 'folder' | 'checkbox' | 'comboBox' | 'inputExcelFile';

export type PrimitiveInputValue = string | number | boolean;

export type InputValue = PrimitiveInputValue | InputValue[];

export type InputDefinition = {
  name: string;
  type: InputKind;
  lineNumber: number;
  defaultValue?: InputValue;
  options?: string[];
};

export type InputOverrides = Record<string, string>;
