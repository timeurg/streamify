import { Module, Provider } from '@nestjs/common';
import * as handlers from './application/handlers';
import { CqrsModule } from '@nestjs/cqrs';
import { _Template_Sagas } from './application/_template_.saga';
import { _Template_Factory } from './domain/_template_.factory';
import { _Template_DomainService } from './domain/_template_.service';

const infrastructure: Provider[] = [

];

const application = [
  ...Object.values(handlers),
  _Template_Sagas
];

const domain = [
  _Template_Factory,
  _Template_DomainService,
];

@Module({
  imports: [CqrsModule],
  providers: [ ...infrastructure, ...application, ...domain],
})
export class _Template_Module {}
