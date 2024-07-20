import { LoggerService, OnModuleDestroy } from '@nestjs/common';
import { promises as fs } from 'node:fs';
import { isAbsolute, join, normalize } from 'node:path';
import { Readable, Writable } from 'node:stream';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DataBusTypeMap } from 'src/databus/domain/databus';
import {
  ProtocolAdaptor,
  ProtocolInjectables,
} from 'src/databus/domain/protocol';

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
        return;
      case 'output':
        this.logger.verbose(`Writing to ${filename}`);
        this.fileHandle = await fs.open(filename, 'w');
        return;
      default:
        break;
    }
    throw new Error('FileProtocolAdaptor: file open failed.');
  }

  getStream(mode: keyof DataBusTypeMap): Readable | Writable {
    if (!this.fileHandle) {
      throw new Error('FileProtocolAdaptor: getting stream before connect.');
    }
    switch (mode) {
      case 'input':
        this.stream = this.fileHandle.createReadStream();
        break;
      case 'output':
        this.stream = this.fileHandle.createWriteStream();
        break;
      default:
        throw new Error('FileDataBus unknown mode');
    }
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
