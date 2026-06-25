const MAX_CONSOLE_LINES = 1000;

let consoleLineCount = 0;

function write(stream: NodeJS.WriteStream, message: string): void {
  if (consoleLineCount >= MAX_CONSOLE_LINES) {
    process.stdout.write('\x1b[2J\x1b[H');
    consoleLineCount = 0;
  }
  stream.write(message);
  consoleLineCount += (message.match(/\n/g) ?? []).length;
}

export const logger = {
  info(message: string) {
    write(process.stdout, `\x1b[36m${message}\x1b[0m\n`);
  },
  error(message: string) {
    write(process.stderr, `\x1b[31m${message}\x1b[0m\n`);
  },
};
