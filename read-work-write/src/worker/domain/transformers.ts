import { Transform } from 'stream';

export interface TransformerFactory {
  create(description: string): Transform;
}
