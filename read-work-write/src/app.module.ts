import { Module } from '@nestjs/common';
import { AppDefaultCommand } from './app.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { ReaderModule } from './reader/reader.module';
import { AppService } from './app.service';

import { CommandHandler, ICommand, ICommandHandler } from '@nestjs/cqrs';

export class LogCommand implements ICommand {
  constructor(public event) {
  }
}

@CommandHandler(LogCommand)
export class LogCommandHandler
  implements ICommandHandler<LogCommand, void> {

  async execute(command: LogCommand): Promise<void> {
    console.log({_event: command.event.constructor.name, ...JSON.parse(JSON.stringify(command.event))});
  }
}

@Module({
  imports: [ReaderModule, CqrsModule.forRoot()],
  providers: [AppDefaultCommand, AppService, LogCommandHandler],
})
export class AppModule {}
