import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { ReaderSagas } from './application/reader.saga';
import { ReaderFactory } from './domain/reader.factory';
import { ReaderDomainService } from './domain/reader.service';
import { WorkerModule } from 'src/worker/worker.module';

const infrastructure: Provider[] = [];

const application = [ReaderSagas];

const domain = [ReaderFactory, ReaderDomainService];

@Module({
  imports: [WorkerModule, CqrsModule],
  providers: [...infrastructure, ...application, ...domain],
})
export class ReaderModule {}
