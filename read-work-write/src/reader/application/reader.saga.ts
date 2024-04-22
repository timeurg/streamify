import { Injectable } from "@nestjs/common";
import { ICommand, Saga, ofType } from "@nestjs/cqrs";
import { Observable, map } from "rxjs";
import { AppStartedEvent } from "src/common/events";
import { GetWorkerCommand } from "src/worker/application/commands";

@Injectable()
export class ReaderSagas {
  @Saga()
  start = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(AppStartedEvent),
      map((event) => new GetWorkerCommand(event.input, event.output, event.workload, event.options)),
    );
  }
}