import { Readable, Writable } from 'node:stream';
import { BehaviorSubject, Observable, Subject } from 'rxjs';
import { DataBusTypeMap } from 'src/databus/domain/databus';
import { ProtocolAdaptor } from 'src/protocol/protocol';

export class StdProtocolAdaptor implements ProtocolAdaptor {
  constructor(connectionString: string) {}

  connect(mode: keyof DataBusTypeMap): Promise<void> {
    this.stream = mode == 'input' ? process.stdin : process.stdout;
    return;
  }

  getStream(): Readable | Writable {
    return this.stream;
  }
  private stream: Readable | Writable;

  disconnect(): Promise<void> {
    return;
  }

  private state$: Subject<'BUSY' | 'READY'> = new BehaviorSubject('READY');
  state(): Observable<'BUSY' | 'READY'> {
    return this.state$.asObservable();
  }
}
