import { Logger, Module } from '@nestjs/common';
import { AppDefaultCommand } from './app.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { AppService } from './app.service';
import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';
import { LoggerModule } from './common/logger.module';
import { WorkerModule } from './worker/worker.module';

export class LogCommand implements ICommand {
  constructor(public event) {}
}

@CommandHandler(LogCommand)
export class LogCommandHandler implements ICommandHandler<LogCommand, void> {
  private logger: Logger;

  async execute(command: LogCommand): Promise<void> {
    this.logger.log({
      _event: command.event.constructor.name,
      ...JSON.parse(JSON.stringify(command.event)),
    });
  }
}

@Module({
  imports: [LoggerModule, WorkerModule, CqrsModule.forRoot()],
  providers: [AppDefaultCommand, AppService, LogCommandHandler],
})
export class AppModule {}
