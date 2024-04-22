import { Inject } from '@nestjs/common';
import { EventPublisher } from '@nestjs/cqrs';
import {
  _Template_,
  _Template_Implement,
  _Template_Properties,
} from './_template_';

type Create_Template_Options = Readonly<{
}>;

export class _Template_Factory {
  @Inject(EventPublisher) private readonly eventPublisher: EventPublisher;

  create(options: Create_Template_Options): _Template_ {  
    return this.eventPublisher.mergeObjectContext(
      new _Template_Implement({
        ...options
      }),
    );
  }

  reconstitute(properties: _Template_Properties): _Template_ {
    return this.eventPublisher.mergeObjectContext(
      new _Template_Implement(properties),
    );
  }
}
