import { LoggerService, OnModuleDestroy } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { isAbsolute, join, normalize } from 'node:path';
import { Readable, Writable } from 'node:stream';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DataBusTypeMap } from 'src/databus/domain/databus';
import { ProtocolAdaptor, ProtocolInjectables } from '../protocol';

export class FileProtocolAdaptor implements OnModuleDestroy, ProtocolAdaptor {
  private fileHandle: fs.FileHandle;
  private stream: Readable | Writable;
  private logger: LoggerService;

  constructor(
    private connectionString: string,
    deps: ProtocolInjectables,
  ) {
    this.logger = deps.logger;
  }

  async connect(mode: keyof DataBusTypeMap): Promise<void> {
    const filename = isAbsolute(this.connectionString)
      ? this.connectionString
      : normalize(join(process.cwd(), this.connectionString));
    switch (mode) {
      case 'input':
        this.logger.verbose(`Reading from ${filename}`);
        this.fileHandle = await fs.open(filename, 'r');
        this.stream = this.fileHandle.createReadStream();
        return;
      case 'output':
        this.logger.verbose(`Writing to ${filename}`);
        this.fileHandle = await fs.open(filename, 'w');
        this.stream = this.fileHandle.createWriteStream();
        return;
      default:
        break;
    }
    throw new Error('FileProtocolAdaptor: file open failed.');
  }

  getStream(): Readable | Writable {
    return this.stream;
  }

  onModuleDestroy() {
    if (this.fileHandle) {
      this.fileHandle.close();
    }
  }

  disconnect(): Promise<void> {
    return;
  }

  private state$: Subject<'BUSY' | 'READY'> = new BehaviorSubject('READY');
  state(): Observable<'BUSY' | 'READY'> {
    return this.state$.asObservable();
  }
}
