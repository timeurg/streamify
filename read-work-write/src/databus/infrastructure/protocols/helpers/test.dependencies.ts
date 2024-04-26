import { Logger } from '@nestjs/common';
import { NoopLog } from 'src/common/helpers/test-logger';

export const deps = {
  logger: new NoopLog(),
};
