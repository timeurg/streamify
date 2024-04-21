import { RootCommand, CommandRunner, Option } from 'nest-commander';
import { ReaderAppService } from './app.service';

interface AppDefaultCommandOptions {
  parameter?: string;
}

@RootCommand({ 
  description: 'Application entrypoint',  
})
export class AppDefaultCommand extends CommandRunner {

  constructor(private readonly service: ReaderAppService) {
    super();
  }

  async run(passedParam: string[], options?: AppDefaultCommandOptions): Promise<void> {
    console.error(JSON.stringify(options, undefined, 2))
    console.error(JSON.stringify(passedParam, undefined, 2))
    console.log('ok')
  }

  @Option({
    flags: '-p, --parameter [parameter]',
    description: 'An arbitrary parameter'
  })
  parseString(val: string): string {
    return val;
  }
}