import { IEvent } from '@nestjs/cqrs';

export class AppStartedEvent implements IEvent {
  constructor() {}
}