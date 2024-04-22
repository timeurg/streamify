import { CommandBus, EventBus } from '@nestjs/cqrs';
import { RootCommand, CommandRunner, Option } from 'nest-commander';
import { DummyEvent } from './_template_/domain/_template_.events';
import { DummyCommand } from './_template_/application/commands';


interface AppDefaultCommandOptions {
  parameter?: string;
}

@RootCommand({ 
  description: 'Application entrypoint',  
})
export class AppDefaultCommand extends CommandRunner {

  constructor(private commandBus: CommandBus, private eventBus: EventBus) {
    super();
  }

  async run(passedParam: string[], options?: AppDefaultCommandOptions): Promise<void> {
    console.log(JSON.stringify(options, undefined, 2));
    console.log(JSON.stringify(passedParam, undefined, 2));
    this.eventBus.publish(new DummyEvent(passedParam, options));
    this.commandBus.execute(new DummyCommand(passedParam, options));
  }

  @Option({
    flags: '-p, --parameter [parameter]',
    description: 'An arbitrary parameter'
  })
  parseString(val: string): string {
    return val;
  }
}