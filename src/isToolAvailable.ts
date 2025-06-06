import { spawn } from 'node:child_process';
import { errorMessage, successMessage } from './highlighting';

export default async function isToolAvailable(
  command: string,
  ...args: string[]
) {
  return new Promise((resolve, reject) => {
    const tool = spawn(command, args);

    tool.on('error', () => reject(errorMessage(`${command} не найден`)));

    tool.stdout.on('data', (data) => {
      console.log(
        successMessage(`${command} найден, ${data.toString().split('\n')[0]}`),
      );
    });

    tool.on('close', (code) => {
      resolve(code);
    });
  });
}
