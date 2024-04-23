import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkerSagas } from './application/worker.saga';
import { WorkerFactory } from './domain/worker.factory';
import { WorkerDomainService } from './domain/worker.service';
import { DataBusModule } from 'src/databus/databus.module';
import { AssignStreamCommandHandler, GetWorkerCommandHandler, StartTransferCommandHandler } from './application/handlers';

const infrastructure: Provider[] = [

];

const application = [
  GetWorkerCommandHandler,
  AssignStreamCommandHandler,
  StartTransferCommandHandler,
  WorkerSagas
];

const domain = [
  WorkerFactory,
  WorkerDomainService,
];

@Module({
  imports: [DataBusModule, CqrsModule],
  providers: [...infrastructure, ...application, ...domain],
})
export class WorkerModule {}
