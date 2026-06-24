import { readdir, readFile, writeFile, mkdir, stat } from 'fs/promises';
import { extname, isAbsolute, join, relative, resolve, sep } from 'path';
import * as readline from 'readline';
import { AppError } from '../utils/errors.js';
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

  const scriptName = await readlinePrompt('Create flow script: script name');
  if (scriptName === undefined) return undefined;

  const fileName = normalizeFlowScriptName(scriptName);
  const filePath = join(scriptsDir, fileName);
  if (await pathExists(filePath)) throw new AppError(`Flow script already exists: ${toPosixPath(relative(process.cwd(), filePath))}`);

  const source = FLOW_TEMPLATE;
  parseFlowProgram(source);
  await mkdir(scriptsDir, { recursive: true });
  await writeFile(filePath, source, 'utf8');

  console.log(`Created ${toPosixPath(relative(process.cwd(), filePath))}`);

  return toPosixPath(relative(process.cwd(), filePath));
}

function readlinePrompt(title: string): Promise<string | undefined> {
  const rl = readline.createInterface({
    input: process.stdin,
    output: process.stdout,
  });

  return new Promise((resolve) => {
    rl.question(`${title}: `, (answer: string) => {
      rl.close();
      resolve(answer || undefined);
    });
  });
}
