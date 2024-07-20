import { Module, Provider } from '@nestjs/common';
import { CqrsModule } from '@nestjs/cqrs';
import { InjectionToken } from './transformers';
import { TransformerFactoryImpl } from './transformers.factory';
import { LoggerModule } from '../common/logger.module';

const infrastructure: Provider[] = [
  {
    provide: InjectionToken.Tranformer_FACTORY,
    useClass: TransformerFactoryImpl,
  },
];

const application = [
];

const domain = [];

@Module({
  imports: [LoggerModule, CqrsModule],
  exports: [...infrastructure],
  providers: [...infrastructure, ...application, ...domain],
})
export class TransformerModule {}
