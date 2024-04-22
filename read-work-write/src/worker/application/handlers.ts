import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetWorkerCommand } from './commands';
import { CreateWorkerOptions, WorkerFactory } from '../domain/worker.factory';
import { WorkerErrors } from '../errors';

@CommandHandler(GetWorkerCommand)
export class GetWorkerCommandHandler
  implements ICommandHandler<GetWorkerCommand, void>
{
  @Inject() private readonly factory: WorkerFactory;

  async execute(command: GetWorkerCommand): Promise<void> {
    
    let options: CreateWorkerOptions = {
      ...command,
    }
    const worker = this.factory.create(options);
    console.log('GetWorkerCommand', command)
  }
}
