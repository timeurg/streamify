import { Injectable } from "@nestjs/common";
import { ICommand, Saga, ofType } from "@nestjs/cqrs";
import { Observable, map } from "rxjs";
import { DummyCommand } from "./commands";
import { DummyEvent } from "../domain/_template_.events";

@Injectable()
export class _Template_Sagas {
  @Saga()
  test = (events$: Observable<any>): Observable<ICommand> => {
    return events$.pipe(
      ofType(DummyEvent),
      map((event) => new DummyCommand()),
    );
  }
}