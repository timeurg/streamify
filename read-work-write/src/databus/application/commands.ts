import { ICommand } from '@nestjs/cqrs';
import { DataBusType } from '../domain/databus';
import { CreateDataBusOptions } from '../domain/databus.factory';

export class GetDataBusCommand implements ICommand {
  constructor(public options: CreateDataBusOptions) {
    console.log('GetDataBusCommand', options);
  }
}