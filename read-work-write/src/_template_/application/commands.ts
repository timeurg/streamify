import { ICommand } from '@nestjs/cqrs';

export class DummyCommand implements ICommand {
  constructor(...args) {
    console.log('DummyCommand', ...args);
  }
}