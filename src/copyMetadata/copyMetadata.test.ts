import { describe, test, mock, before, after } from 'node:test';
import assert from 'node:assert';
import child_process from 'node:child_process';
import { EventEmitter } from 'node:events';
import { Readable } from 'node:stream';
import copyMetadata from './copyMetadata';

let exiftool: child_process.ChildProcessWithoutNullStreams;
function mockSpawn(): child_process.ChildProcessWithoutNullStreams {
  const proc =
    new EventEmitter() as child_process.ChildProcessWithoutNullStreams;
  proc.stderr = new EventEmitter() as Readable;
  exiftool = proc;
  return proc;
}

describe('copyMetadata', () => {
  before(() => {
    mock.method(child_process, 'spawn', mockSpawn);
  });

  after(() => {
    mock.restoreAll();
  });

  test('resolve (code === 0)', async () => {
    const promise = copyMetadata('source.mov', 'target.mov');
    process.nextTick(() => {
      exiftool.stderr.emit('data', 'Some exiftool output');
      exiftool.emit('close', 0);
    });
    await promise;
  });

  test('reject (code !== 0))', async () => {
    const promise = copyMetadata('source.mov', 'target.mov');
    process.nextTick(() => {
      exiftool.stderr.emit('data', Buffer.from('Some exiftool error'));
      exiftool.emit('close', 1);
    });
    await assert.rejects(promise, /Exiftool аварийно завершил работу/);
  });
});
