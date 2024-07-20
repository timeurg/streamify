import { Transform } from 'stream';

export enum InjectionToken {
  Tranformer_FACTORY = 'TransformerFactory',
}


export enum TransformerErrors {
  UNKNOWN_CALL_STRING = 'Input [%s] does not match any known workers'
}

export interface TransformerFactory {
  create(description: string): Transform;
}
