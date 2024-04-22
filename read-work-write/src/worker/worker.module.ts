import { Module, Provider } from '@nestjs/common';
import * as handlers from './application/handlers';
import { CqrsModule } from '@nestjs/cqrs';
import { WorkerSagas } from './application/worker.saga';
import { WorkerFactory } from './domain/worker.factory';
import { WorkerDomainService } from './domain/worker.service';

const infrastructure: Provider[] = [

];

const application = [
  ...Object.values(handlers),
  WorkerSagas
];

const domain = [
  WorkerFactory,
  WorkerDomainService,
];

@Module({
  imports: [CqrsModule],
  providers: [ ...infrastructure, ...application, ...domain],
})
export class WorkerModule {}
