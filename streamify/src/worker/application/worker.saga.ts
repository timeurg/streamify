import { Injectable } from '@nestjs/common';
import { ICommand, Saga, UnhandledExceptionBus, ofType } from '@nestjs/cqrs';
import {
  Observable,
  Subject,
  filter,
  map,
  mergeMap,
  takeUntil,
  zip,
} from 'rxjs';
import {
  WorkerConnectStarted,
  WorkerReadyEvent,
} from '../domain/worker.events';
import {
  GetDataBusCommand,
  GetDataBusStreamCommand,
} from 'src/databus/application/commands';
import { LogCommand } from 'src/app.module';
import {
  DataBusConnectSuccessEvent,
  DataBusStreamCreatedEvent,
} from 'src/databus/domain/databus.events';
import { AssignStreamCommand, GetWorkerCommand, StartTransferCommand } from './commands';
import { AppStartedEvent } from 'src/common/events';

@Injectable()
export class WorkerSagas {
  @Saga()
  start = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(AppStartedEvent),
      map(
        (event) =>
          new GetWorkerCommand(
            event.input,
            event.output,
            event.workload,
            event.options,
          ),
      ),
    );
  };
  
  @Saga()
  connect = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(WorkerConnectStarted),
      mergeMap((event) => [
        new GetDataBusCommand({ connectionString: event.input, mode: 'input' }),
        new GetDataBusCommand({
          connectionString: event.output,
          mode: 'output',
        }),
      ]),
    );
  };

  @Saga()
  connected = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(DataBusConnectSuccessEvent),
      map((event) => new GetDataBusStreamCommand(event.dataBus)),
    );
  };

  @Saga()
  streamReady = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(DataBusStreamCreatedEvent),
      map((event) => new AssignStreamCommand(event.dataBus, event.stream)),
    );
  };

  @Saga()
  workerReady = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(WorkerReadyEvent),
      map((event) => new StartTransferCommand(event.worker)),
    );
  };

  private destroy$ = new Subject<void>();

  constructor(private unhandledExceptionsBus: UnhandledExceptionBus) {
    this.unhandledExceptionsBus
      .pipe(takeUntil(this.destroy$))
      .subscribe((exceptionInfo) => {
        console.error(exceptionInfo);
        process.exit(1);
      });
  }

  onModuleDestroy() {
    this.destroy$.next();
    this.destroy$.complete();
  }
}
