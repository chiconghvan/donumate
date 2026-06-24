import type { UiProvider, ListPickerArgs, TextInputArgs, UpdateInfo, UpdateChoice, FlowScriptEditorArgs } from './ui-types.js';
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

async function readlineUpdatePrompt(update: UpdateInfo): Promise<UpdateChoice | undefined> {
  const rl = createReadlineInterface();

  try {
    console.log(`\nUpdate available: ${update.currentVersion} → ${update.latestVersion}`);
    console.log(`Asset: ${update.assetName}`);
    console.log(`Release: ${update.releaseUrl}\n`);

    const answer = await readlineQuestion(rl, 'Install update now? (y/n): ');

    if (answer.toLowerCase() === 'y' || answer.toLowerCase() === 'yes') {
      return 'install';
    }
    return 'skip';
  } finally {
    rl.close();
  }
}

async function readlineFlowScriptEditor(args: FlowScriptEditorArgs): Promise<string | undefined> {
  const { filePath, initialSource } = args;

  console.log(`\nCreate flow script: ${filePath}`);
  console.log('Flow script editor is not available in headless mode.');
  console.log('Please edit the file manually after creation.\n');

  // Return the initial template for now
  return initialSource;
}

export const readlineUi: UiProvider = {
  runListPicker: readlineListPicker,
  runTextInputPrompt: readlineTextInput,
  runUpdatePrompt: readlineUpdatePrompt,
  runFlowScriptEditor: readlineFlowScriptEditor,
};
