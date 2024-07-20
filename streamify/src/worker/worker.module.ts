import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkerSagas } from './worker.saga';
import { WorkerFactory } from './domain/worker.factory';
import { WorkerDomainService } from './domain/worker.service';
import { DataBusModule } from 'src/databus/databus.module';
import { TransformerModule } from 'src/transformer/transformer.module';
import {
  AssignStreamCommandHandler,
  GetWorkerCommandHandler,
  StartTransferCommandHandler,
} from './application/handlers';
import { LoggerModule } from 'src/common/logger.module';

const infrastructure: Provider[] = [
];

const application = [
  GetWorkerCommandHandler,
  AssignStreamCommandHandler,
  StartTransferCommandHandler,
  WorkerSagas,
];

const domain = [WorkerFactory, WorkerDomainService];

@Module({
  imports: [LoggerModule, TransformerModule, DataBusModule, CqrsModule],
  providers: [...infrastructure, ...application, ...domain],
})
export class WorkerModule {}
