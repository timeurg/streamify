import { IEvent } from '@nestjs/cqrs';

export class DummyEvent implements IEvent {
  constructor(...args) {}
}
