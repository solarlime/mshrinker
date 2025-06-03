import path from 'node:path';
import fs from 'node:fs';

export default function defineFolders(args: string[]): {
  inputFolder: string;
  outputFolder: string;
} {
  let inputFolder: string, outputFolder: string;
  try {
    inputFolder = path.resolve(args[0]);
    outputFolder = path.resolve(args[1]);
  } catch (error) {
    throw new Error(
      '❌  Ошибка: не удалось определить абсолютные пути к папкам. Проверьте корректность ввода',
    );
  }

  if (fs.existsSync(inputFolder)) {
    console.log(`ℹ️ Папка с исходными файлами: ${inputFolder}`);
  } else {
    throw new Error(
      `❌  Ошибка: папка с исходными файлами (${inputFolder}) не существует`,
    );
  }

  if (fs.existsSync(outputFolder)) {
    console.log(`ℹ️ Папка для сжатых файлов: ${outputFolder}`);
  } else {
    throw new Error(
      `❌  Ошибка: папка для сжатых файлов (${outputFolder}) не существует`,
    );
  }
  return { inputFolder, outputFolder };
}
