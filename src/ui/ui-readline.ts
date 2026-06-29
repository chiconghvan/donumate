import type { UiProvider, ListPickerArgs, TextInputArgs } from './ui-types.js';
import * as readline from 'readline';

function createReadlineInterface(): readline.Interface {
  return readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });
}

function readlineQuestion(rl: readline.Interface, query: string): Promise<string> {
  return new Promise((resolve) => {
    rl.question(query, (answer) => {
      resolve(answer);
    });
  });
}

async function readlineListPicker<T extends string>(args: ListPickerArgs<T>): Promise<T | undefined> {
  const { title, options, initialValue, submitHint = 'select', cancelHint = 'back' } = args;

  if (options.length === 0) return undefined;

  const rl = createReadlineInterface();

  try {
    console.log(`\n${title}\n`);

    let selectedIndex = initialValue
      ? options.findIndex((o) => o.value === initialValue)
      : 0;
    if (selectedIndex < 0) selectedIndex = 0;

    options.forEach((option, index) => {
      const prefix = index === selectedIndex ? '> ' : '  ';
      const marker = index === selectedIndex ? ' *' : '';
      console.log(`${prefix}${option.label}${marker}`);
    });

    console.log(`\n[Enter] ${submitHint}   [Esc] ${cancelHint}   [↑↓] move\n`);

    const answer = await readlineQuestion(rl, 'Choose number (0-' + (options.length - 1) + '): ');
    const num = parseInt(answer, 10);

    if (isNaN(num) || num < 0 || num >= options.length) {
      return undefined;
    }

    return options[num].value;
  } finally {
    rl.close();
  }
}

async function readlineTextInput(args: TextInputArgs): Promise<string | undefined> {
  const { title, defaultValue = '' } = args;

  const rl = createReadlineInterface();

  try {
    console.log(`\n${title}`);
    const answer = await readlineQuestion(rl, `> ${defaultValue ? `[${defaultValue}]: ` : ''}`);

    if (answer === '' && defaultValue) {
      return defaultValue;
    }

    return answer || undefined;
  } finally {
    rl.close();
  }
}

export const readlineUi: UiProvider = {
  runListPicker: readlineListPicker,
  runTextInputPrompt: readlineTextInput,
};
