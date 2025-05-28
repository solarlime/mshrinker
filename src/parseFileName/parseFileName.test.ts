import { describe, test } from 'mocha';
import { expect } from 'chai';
import allowedExtensions from './allowedExtensions';
import parseFileName from './parseFileName';

const testCases = [
  ...allowedExtensions.map((extension) => ({
    case: `file.${extension}`,
    expectedName: 'file',
    expectedExtension: extension,
  })),
  ...allowedExtensions.map((extension) => ({
    case: `file.${extension.toLowerCase()}`,
    expectedName: 'file',
    expectedExtension: extension,
  })),
  ...allowedExtensions.map((extension) => ({
    case: `file.${extension.toUpperCase()}`,
    expectedName: 'file',
    expectedExtension: extension,
  })),
  {
    case: `.${allowedExtensions[0]}`,
    expectedName: null,
    expectedExtension: allowedExtensions[0],
  },
  {
    case: `..${allowedExtensions[0]}`,
    expectedName: '.',
    expectedExtension: allowedExtensions[0],
  },
  {
    case: `file.something.${allowedExtensions[0]}`,
    expectedName: 'file.something',
    expectedExtension: allowedExtensions[0],
  },
  {
    case: `file something.${allowedExtensions[0]}`,
    expectedName: 'file something',
    expectedExtension: allowedExtensions[0],
  },
  {
    case: 'file.htm',
    expectedName: 'file',
    expectedExtension: 'htm',
  },
  {
    case: 'file.html',
    expectedName: 'file',
    expectedExtension: 'html',
  },
  {
    case: '.htm',
    expectedName: null,
    expectedExtension: 'htm',
  },
  {
    case: 'file',
    expectedName: 'file',
    expectedExtension: null,
  },
  {
    case: 'file.',
    expectedName: 'file',
    expectedExtension: null,
  },
];

describe('parseFileName', () => {
  testCases.forEach((file) => {
    test(`${file.case}`, () => {
      const { name, extension } = parseFileName(file.case);
      expect(name).to.be.equal(file.expectedName);
      expect(extension).to.be.equal(file.expectedExtension);
    });
  });
});
