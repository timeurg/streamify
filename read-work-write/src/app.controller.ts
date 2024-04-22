import { CommandBus, EventBus } from '@nestjs/cqrs';
import { RootCommand, CommandRunner, Option } from 'nest-commander';
import { AppStartedEvent } from './common/events';


interface AppDefaultCommandOptions {
  parameter?: string;
  workload?: string[];
}

@RootCommand({ 
  description: 'Application entrypoint',  
})
export class AppDefaultCommand extends CommandRunner {

  constructor(private commandBus: CommandBus, private eventBus: EventBus) {
    super();
  }

  async run(args: string[], options?: AppDefaultCommandOptions): Promise<void> {
    console.log(JSON.stringify(process.env, undefined, 2))
    console.log(JSON.stringify(options, undefined, 2));
    console.log(JSON.stringify(args, undefined, 2));
    const [input, output] = args;
    this.eventBus.publish(new AppStartedEvent(input || '', output || '', options?.workload || [], options || {}));
  }

  @Option({
    flags: '-p, --parameter [parameter]',
    description: 'An arbitrary parameter'
  })
  parseString(val: string): string {
    return val.trim();
  }

  @Option({
    flags: '-w, --workload <options...>',
    description: 'Specify workload',
  })
  parseOptions(option: string, optionsAccumulator: string[] = []): string[] {
    optionsAccumulator.push(option.trim());
    return optionsAccumulator;
  }
}