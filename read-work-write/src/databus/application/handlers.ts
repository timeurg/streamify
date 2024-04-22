import { Inject, NotFoundException } from '@nestjs/common';
import { CommandHandler, ICommandHandler } from '@nestjs/cqrs';
import { GetDataBusCommand } from './commands';
import { InjectionToken } from './injection-tokens';
import { DataBusFactory } from '../domain/databus.factory';


@CommandHandler(GetDataBusCommand)
export class GetDataBusCommandHandler
  implements ICommandHandler<GetDataBusCommand, void>
{
  @Inject(InjectionToken.DataBus_FACTORY) private factory: DataBusFactory;

  async execute(command: GetDataBusCommand): Promise<void> {
    const bus = this.factory.create(command.options);
    bus.connect();
    console.log('GetDataBusCommandHandler', command)
  }
}
