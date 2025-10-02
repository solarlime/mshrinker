import { AllowedExtensionsEnum } from './allowedExtensions';

const defineOutputExtension = (extension: AllowedExtensionsEnum) => {
  switch (extension) {
    case AllowedExtensionsEnum.MP4:
      return AllowedExtensionsEnum.MP4;
    default:
      // Exiftool не может записывать метаданные в контейнер m4v. Используем mov
      // Метаданные из .thm также полноценно переносятся только в случае использования контейнера mov
      return AllowedExtensionsEnum.MOV;
  }
};

export default defineOutputExtension;
