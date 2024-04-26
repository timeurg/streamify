import { IEvent } from '@nestjs/cqrs';

export class AppStartedEvent implements IEvent {
  constructor(
    public input: string,
    public output: string,
    public workload: string[],
    public options: unknown,
  ) {}
}
