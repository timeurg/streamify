import { BadRequestException, Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { AssignStreamCommand, GetWorkerCommand, StartTransferCommand } from './commands';
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
    const worker = this.factory.get(options);
    worker.connect();
  }
}

@CommandHandler(AssignStreamCommand)
export class AssignStreamCommandHandler
  implements ICommandHandler<AssignStreamCommand, void>
{
  @Inject() private readonly factory: WorkerFactory;

  async execute(command: AssignStreamCommand): Promise<void> {
    this.factory.get().setStream(command.dataBus.mode, command.stream);
  }
}

@CommandHandler(StartTransferCommand)
export class StartTransferCommandHandler
  implements ICommandHandler<StartTransferCommand, void>
{

  async execute(command: StartTransferCommand): Promise<void> {
    command.worker.startTransfer();
  }
}