import { spawn } from 'node:child_process';

export default async function isToolAvailable(
  command: string,
  ...args: string[]
) {
  return new Promise((resolve, reject) => {
    const tool = spawn(command, args);

    tool.on('error', () => reject(`❌  ${command} не найден`));

    tool.stdout.on('data', (data) => {
      console.log(`✅  ${command} найден, ${data.toString().split('\n')[0]}`);
    });

    tool.on('close', (code) => {
      resolve(code);
    });
  });
}
