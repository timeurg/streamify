import { Transform } from 'stream';

export enum InjectionToken {
  Tranformer_FACTORY = 'TransformerFactory',
}


export enum TransformerErrors {
  UNKNOWN_CALL_STRING = 'Input [%s] does not match any known transformers',
  RESULT_INCOMPATIBLE = 'Module import [%s] does not seem to return any transformer streams',
}

export interface TransformerFactory {
  create(description: string): Promise<Transform>;
}
