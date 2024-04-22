import { Injectable } from "@nestjs/common";
import { ICommand, Saga, UnhandledExceptionBus, ofType } from "@nestjs/cqrs";
import { Observable, Subject, map, mergeMap, takeUntil } from "rxjs";
import { WorkerConnectStarted } from "../domain/worker.events";
import { GetDataBusCommand } from "src/databus/application/commands";

@Injectable()
export class WorkerSagas {
  @Saga()
  connect = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(WorkerConnectStarted),
      mergeMap((event) => [
        new GetDataBusCommand("input", { connectionString: event.input } ),
        new GetDataBusCommand("output", { connectionString: event.output } ),
      ]),
    );
  }

  
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