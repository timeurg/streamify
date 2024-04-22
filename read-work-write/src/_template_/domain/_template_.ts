import { AggregateRoot } from '@nestjs/cqrs';

export type _Template_EssentialProperties = Readonly<
  Required<{
  }>
>;

export type _Template_OptionalProperties = Readonly<
  Partial<{
  }>
>;

export type _Template_Properties = _Template_EssentialProperties &
  Required<_Template_OptionalProperties>;

export interface _Template_ {
  connect: () => void;
}

export class _Template_Implement extends AggregateRoot implements _Template_ {

    constructor(properties: _Template_Properties) {
      super();
      Object.assign(this, properties);
    }

    connect(): void {
    };
}