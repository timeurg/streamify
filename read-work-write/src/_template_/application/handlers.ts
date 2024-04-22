import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { DummyCommand } from './commands';


@CommandHandler(DummyCommand)
export class DummyCommandHandler
  implements ICommandHandler<DummyCommand, void>
{
  async execute(command: DummyCommand): Promise<void> {
    console.log('DummyCommandHandler')
  }
}
