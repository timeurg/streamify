import { Transform } from 'stream';

export interface TransformerFactory {
  create(code: string): Transform;
}
