import test, { describe } from 'node:test';
import assert from 'node:assert/strict';
import defineMetaFile from './defineMetaFile';
import { AllowedExtensionsEnum } from '../allowedExtensions';

const inputFile = 'FILE_1.AVI';
const inputName = 'FILE_1';
const thmFiles = ['FILE_1.THM', 'FILE_2.THM'];
const thmFilesNoMatch = ['FILE_2.THM'];

describe('defineMetaFile', () => {
  test('AVI, thmFiles содержит метафайл', () => {
    const result = defineMetaFile(
      inputFile,
      inputName,
      AllowedExtensionsEnum.AVI,
      thmFiles,
    );
    assert.equal(result, 'FILE_1.THM');
  });

  test('AVI, thmFiles не содержит метафайл', () => {
    const result = defineMetaFile(
      inputFile,
      inputName,
      AllowedExtensionsEnum.AVI,
      thmFilesNoMatch,
    );
    assert.equal(result, inputFile);
  });

  test('не AVI', () => {
    const result = defineMetaFile(
      'FILE.mp4',
      'FILE',
      AllowedExtensionsEnum.MP4,
      thmFiles,
    );
    assert.equal(result, 'FILE.mp4');
  });
});
