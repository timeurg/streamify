import { CommandBus, EventBus } from '@nestjs/cqrs';
import { RootCommand, CommandRunner, Option } from 'nest-commander';
import { AppStartedEvent } from './common/events';
import { Inject, LoggerService } from '@nestjs/common';
import { CommonInjectionTokens } from './common/injection-tokens';

interface AppDefaultCommandOptions {
  parameter?: string;
  workload?: string[];
  verbose?: boolean;
}

@RootCommand({
  description: 'Application entrypoint',
})
export class AppDefaultCommand extends CommandRunner {
  @Inject(CommonInjectionTokens.App_Logger) private logger: LoggerService;

  constructor(
    private commandBus: CommandBus,
    private eventBus: EventBus,
  ) {
    super();
  }

  async run(args: string[], options?: AppDefaultCommandOptions): Promise<void> {
    if (options.verbose) {
      this.logger.setLogLevels(['verbose']);
    } else {
      this.logger.setLogLevels(['log']);
    }
    this.logger.verbose('Verbose output enabled');
    const [input, output] = args;
    this.eventBus.publish(
      new AppStartedEvent(
        input || '',
        output || '',
        options?.workload || [],
        options || {},
      ),
    );
  }

  @Option({
    flags: '--verbose',
    description: 'Verbose output',
    defaultValue: false,
  })
  verbose(): boolean {
    return true;
  }

  @Option({
    flags: '-w, --workload <options...>',
    description: 'Specify workload',
  })
  parseOptions(option: string, optionsAccumulator: string[] = []): string[] {
    const workload = option.trim();
    if (workload.indexOf(' ') !== -1) {
      workload.split(' ').map(i => optionsAccumulator.push(i))
    } else {
      optionsAccumulator.push(workload);
    }
    return optionsAccumulator;
  }
}
