import { Transform } from 'stream';
import { TransformerFactory } from '../domain/transformers';
import * as zlib from 'node:zlib';
import { Inject, Logger } from '@nestjs/common';

export class TransformerFactoryImpl implements TransformerFactory {
  @Inject() private logger: Logger;
  create(code: string): Transform {
    switch (code) {
      case 'gzip':
        this.logger.verbose('Creating gzip job');
        return zlib.createGzip();
      default:
        break;
    }
  }
}
