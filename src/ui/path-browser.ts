import { readdir } from 'fs/promises';
import { dirname, join, parse, resolve } from 'path';
import { runListPicker, type ListPickerOption } from './list-picker.js';
import { runTextInputPrompt } from './text-input-prompt.js';

/** List available Windows drives (C:, D:, etc.) at root level */
async function listDrives(): Promise<string[]> {
  const drives: string[] = [];
  for (let ch = 65; ch <= 90; ch++) {
    const letter = String.fromCharCode(ch);
    try {
      await readdir(`${letter}:\\`);
      drives.push(`${letter}:\\`);
    } catch {
      // drive not available
    }
  }
  return drives;
}

export async function browsePath(mode: 'file' | 'folder', initialPath: string): Promise<string> {
  // If initialPath points to an existing file, start browsing its parent directory
  let cwd: string;
  if (initialPath) {
    cwd = resolve(process.cwd(), initialPath);
    try {
      const stat = await import('fs/promises').then((m) => m.stat(cwd));
      if (stat.isFile()) cwd = dirname(cwd);
    } catch {
      // path invalid, start from resolved parent
      cwd = dirname(resolve(process.cwd(), initialPath));
    }
  } else {
    cwd = process.cwd();
  }

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
    const parsed = parse(cwd);
    const root = parsed.root;

    if (mode === 'folder') {
      options.push({ value: '__choose__', label: `Select current folder (${cwd})` });
    }

    options.push({ value: '__type__', label: 'Type/paste path manually' });

    // At filesystem root offer to switch drives
    if (cwd === root || cwd === root.slice(0, -1)) {
      const drives = await listDrives();
      for (const drive of drives) {
        if (drive !== root) {
          options.push({ value: '__drive__' + drive, label: `[Drive] ${drive}` });
        }
      }
    }

    if (cwd !== root && cwd !== root.slice(0, -1)) {
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

    // Switch to different drive
    if (typeof choice === 'string' && choice.startsWith('__drive__')) {
      cwd = choice.slice('__drive__'.length);
      continue;
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
