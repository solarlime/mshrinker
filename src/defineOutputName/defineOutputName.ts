import { readdir } from 'node:fs/promises';
import { errorMessage } from '../highlighting';
import { AllowedExtensionsEnum } from '../allowedExtensions';

const defineOutputName = async (
  outputFolder: string,
  nameToFind: string,
  extension: AllowedExtensionsEnum,
) => {
  let duplicates: string[] | null = [];
  try {
    const files = await readdir(outputFolder);
    for (const file of files) {
      if (file.startsWith(nameToFind)) {
        duplicates.push(file);
      }
    }
    if (!duplicates.length) {
      return `${nameToFind}.${extension}`;
    } else {
      return `${nameToFind}_${duplicates.length}.${extension}`;
    }
  } catch (error) {
    throw new Error(
      errorMessage('Ошибка: не удалось прочитать папку с итоговыми файлами'),
    );
  } finally {
    duplicates = null;
  }
};

export default defineOutputName;
