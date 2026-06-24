import { mkdir, writeFile } from 'fs/promises';
import { extname, isAbsolute, join, relative, resolve, sep } from 'path';
import { AppError } from '../utils/errors.js';
import { getUi } from '../ui/ui-provider.js';

const FLOW_TEMPLATE = `inputs {
  startUrl: input = "https://example.com"
}

before() {
  log("Before run")
}

running() {
  goto("\${startUrl}")
  waitLoad()
}

after() {
  log("Done")
}
`;

function toPosixPath(path: string): string {
  return path.split(sep).join('/');
}

function normalizeFlowScriptName(value: string): string {
  const trimmed = value.trim();
  if (!trimmed) throw new AppError('Script name is required.');
  if (trimmed.includes('/') || trimmed.includes('\\')) throw new AppError('Script name cannot include folders.');
  if (trimmed.includes('..')) throw new AppError('Script name cannot include "..".');
  if (isAbsolute(trimmed)) throw new AppError('Script name must not be an absolute path.');
  const extension = extname(trimmed);
  if (extension && extension.toLowerCase() !== '.flow') throw new AppError('Script name must use .flow extension.');
  return extension ? trimmed : `${trimmed}.flow`;
}

export async function createFlowScript(): Promise<string | undefined> {
  const scriptsDir = resolve(process.cwd(), 'scripts');
  const ui = await getUi();

  const scriptName = await ui.runTextInputPrompt({
    title: 'Create flow script: script name',
    validate: (value) => {
      try {
        normalizeFlowScriptName(value);
        return undefined;
      } catch (error) {
        return error instanceof Error ? error.message : String(error);
      }
    },
  });

  if (scriptName === undefined) return undefined;

  const fileName = normalizeFlowScriptName(scriptName);
  const filePath = join(scriptsDir, fileName);
  const source = FLOW_TEMPLATE;
  await mkdir(scriptsDir, { recursive: true });
  await writeFile(filePath, source, 'utf8');

  return toPosixPath(relative(process.cwd(), filePath));
}
