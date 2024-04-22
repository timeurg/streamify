import { ICommand } from '@nestjs/cqrs';

export class GetWorkerCommand implements ICommand {
  constructor(public input: string, public output: string, public workload: string[], public options: unknown) {
    console.log('GetWorkerCommand', input, output, options);
  }
}