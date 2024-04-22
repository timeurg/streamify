import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { ReaderDummyCommand } from './commands';


@CommandHandler(ReaderDummyCommand)
export class DummyCommandHandler
  implements ICommandHandler<ReaderDummyCommand, void>
{
  async execute(command: ReaderDummyCommand): Promise<void> {
    console.log('ReaderDummyCommandHandler')
  }
}
