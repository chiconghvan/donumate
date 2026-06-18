import { mkdir, stat, writeFile } from 'fs/promises';
import { extname, isAbsolute, join, relative, resolve, sep } from 'path';
import { AppError } from '../utils/errors.js';
import { runFlowScriptEditor } from '../ui/flow-script-editor.js';
import { runTextInputPrompt } from '../ui/text-input-prompt.js';
import { parseFlowProgram } from './dsl/parser.js';

const FLOW_TEMPLATE = `inputs {
}

before() {
}

running() {

}

after() {
}
`;

function toPosixPath(path: string): string {
  return path.split(sep).join('/');
}

async function pathExists(path: string): Promise<boolean> {
  return stat(path).then(() => true, () => false);
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

  const scriptName = await runTextInputPrompt({
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
  if (await pathExists(filePath)) throw new AppError(`Flow script already exists: ${toPosixPath(relative(process.cwd(), filePath))}`);

  const source = await runFlowScriptEditor({
    filePath: toPosixPath(relative(process.cwd(), filePath)),
    initialSource: FLOW_TEMPLATE,
  });

  if (source === undefined) return undefined;

  parseFlowProgram(source);
  await mkdir(scriptsDir, { recursive: true });
  await writeFile(filePath, source, 'utf8');

  return toPosixPath(relative(process.cwd(), filePath));
}
