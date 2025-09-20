import { AllowedExtensionsEnum } from './parseFileName/allowedExtensions';

const defineOutputExtension = (extension: AllowedExtensionsEnum) => {
  switch (extension) {
    case AllowedExtensionsEnum.MP4:
      return AllowedExtensionsEnum.MP4;
    default:
      // Exiftool не может записывать метаданные в контейнер m4v. Используем mov
      return AllowedExtensionsEnum.MOV;
  }
};

export default defineOutputExtension;
