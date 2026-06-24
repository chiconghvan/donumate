export function isPackagedExecutable(): boolean {
  const execPath = process.execPath.toLowerCase();
  if (process.platform === 'win32') {
    return execPath.endsWith('.exe') && !execPath.endsWith('node.exe');
  }

  return !execPath.endsWith('/node') && !execPath.endsWith('node');
}
