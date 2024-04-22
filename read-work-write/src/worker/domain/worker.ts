import { AggregateRoot } from '@nestjs/cqrs';
import { WorkerConnectStarted } from './worker.events';
import { DataBus } from 'src/databus/domain/databus';
import { DataBusFactory } from 'src/databus/domain/databus.factory';
import { Inject, Injectable } from '@nestjs/common';
import { DataBusDomainService } from 'src/databus/domain/databus.service';
import { InjectionToken } from 'src/databus/application/injection-tokens';

export type WorkerEssentialProperties = Readonly<
  Required<{
    input: string;
    output: string;
  }>
>;

export type WorkerOptionalProperties = Readonly<
  Partial<{
    workload: string[];
  }>
>;

export type WorkerProperties = WorkerEssentialProperties &
  WorkerOptionalProperties;

export interface Worker {
  connect: () => void;
}

@Injectable()
export class WorkerImplement extends AggregateRoot implements Worker {
    // @Inject(InjectionToken.DataBus_FACTORY) private dataBusFactory: DataBusFactory;
    // private inputBus: DataBus;
    // private outputBus: DataBus;
    private readonly input: string;
    private readonly output: string;
    private readonly workload: string[];

    constructor(properties: WorkerProperties) {
      super();
      Object.assign(this, properties);
      this.autoCommit = true;
    }

    connect(): void {
      this.apply(new WorkerConnectStarted(this.input, this.output));
      // console.log(this.dataBusFactory, 'gg') // doesn't work for some reason
      // this.inputBus = this.dataBusFactory.create({connectionString: this.input});
      // this.inputBus.connect()
      // this.outputBus = this.dataBusFactory.create({connectionString: this.output});
    };
}