import { readdir } from 'fs/promises';
import { dirname, join, parse, resolve } from 'path';
import { runListPicker, type ListPickerOption } from './list-picker.js';
import { runTextInputPrompt } from './text-input-prompt.js';

export async function browsePath(mode: 'file' | 'folder', initialPath: string): Promise<string> {
  let cwd = resolve(process.cwd(), initialPath || '.');
  while (true) {
    let items: { name: string; isDirectory: boolean }[] = [];
    try {
      const dirents = await readdir(cwd, { withFileTypes: true });
      items = dirents
        .map((item) => ({ name: item.name, isDirectory: item.isDirectory() }))
        .sort((a, b) => Number(b.isDirectory) - Number(a.isDirectory) || a.name.localeCompare(b.name));
    } catch {
      items = [];
    }

    const options: ListPickerOption<string>[] = [];

    if (mode === 'folder') {
      options.push({ value: '__choose__', label: `Select current folder (${cwd})` });
    }

    options.push({ value: '__type__', label: 'Type/paste path manually' });

    const root = parse(cwd).root;
    if (cwd !== root) {
      options.push({ value: '__parent__', label: '.. (Parent Directory)' });
    }

    for (const item of items) {
      options.push({
        value: join(cwd, item.name),
        label: `${item.isDirectory ? '[Dir]' : '[File]'} ${item.name}`,
      });
    }

    options.push({ value: '__cancel__', label: 'Cancel (Back to Form)' });

    const choice = await runListPicker({
      title: `Browse ${mode} in ${cwd}`,
      options,
      submitHint: 'open/select',
      cancelHint: 'cancel',
    });

    if (choice === undefined || choice === '__cancel__') return initialPath;
    if (choice === '__choose__') return cwd;

    if (choice === '__type__') {
      const manualPath = await runTextInputPrompt({
        title: `Enter ${mode} path`,
        defaultValue: cwd,
      });
      if (manualPath === undefined) continue;
      return resolve(cwd, manualPath);
    }

    if (choice === '__parent__') {
      cwd = cwd === root ? root : dirname(cwd);
      continue;
    }

    const selectedItem = items.find((item) => join(cwd, item.name) === choice);
    if (selectedItem?.isDirectory) {
      cwd = choice;
    } else if (mode === 'file') {
      return choice;
    }
  }
}
