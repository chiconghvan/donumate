export const logger = {
  info(message: string) {
    process.stdout.write(`\x1b[36m${message}\x1b[0m\n`);
  },
  error(message: string) {
    process.stderr.write(`\x1b[31m${message}\x1b[0m\n`);
  },
};
