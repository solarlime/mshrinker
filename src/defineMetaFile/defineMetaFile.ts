import { AllowedExtensionsEnum } from '../allowedExtensions';
import { infoMessage, successMessage, warningMessage } from '../highlighting';

const defineMetaFile = (
  inputFile: string,
  inputName: string,
  inputExtension: AllowedExtensionsEnum,
  thmFiles: string[],
) => {
  let metaFile;
  if (inputExtension === AllowedExtensionsEnum.AVI) {
    console.log(infoMessage(`Ищу файл метаданных для ${inputFile}...`));
    metaFile = thmFiles.find((file) => file.includes(inputName));
    if (metaFile) {
      console.log(successMessage(`Найден файл ${metaFile}!`));
      console.log(
        infoMessage(
          `Копирую метаданные файла ${inputFile} из файла ${metaFile}`,
        ),
      );
    } else {
      metaFile = inputFile;
      console.log(
        warningMessage(
          `Метаданные не найдены. Извлекаю данные из исходного файла`,
        ),
      );
    }
  } else {
    metaFile = inputFile;
    console.log(infoMessage(`Копирую метаданные файла ${inputFile}`));
  }
  return metaFile;
};

export default defineMetaFile;
