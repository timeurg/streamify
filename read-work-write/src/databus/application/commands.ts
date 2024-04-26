import { ICommand } from '@nestjs/cqrs';
import { DataBus, DataBusType } from '../domain/databus';
import { CreateDataBusOptions } from '../domain/databus.factory';

export class GetDataBusCommand implements ICommand {
  constructor(public options: CreateDataBusOptions) {}
}

export class GetDataBusStreamCommand implements ICommand {
  constructor(public bus: DataBus) {}
}
