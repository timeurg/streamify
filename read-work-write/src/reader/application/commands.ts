import { ICommand } from '@nestjs/cqrs';

export class ReaderDummyCommand implements ICommand {
  constructor(...args) {
    console.log('ReaderDummyCommand', ...args);
  }
}