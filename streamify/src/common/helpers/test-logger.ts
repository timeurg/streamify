import { LogLevel, Logger, LoggerService } from '@nestjs/common';

export class NoopLog implements LoggerService {
  log(message: any, ...optionalParams: any[]) {}
  error(message: any, ...optionalParams: any[]) {}
  warn(message: any, ...optionalParams: any[]) {}
  debug?(message: any, ...optionalParams: any[]) {}
  verbose?(message: any, ...optionalParams: any[]) {}
  fatal?(message: any, ...optionalParams: any[]) {}
  setLogLevels?(levels: LogLevel[]) {}
}
