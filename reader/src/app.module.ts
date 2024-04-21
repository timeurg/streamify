import { Module } from '@nestjs/common';
import { AppDefaultCommand } from './app.command';
import { ReaderAppService } from './app.service';

@Module({
  imports: [],
  providers: [ReaderAppService, AppDefaultCommand],
})
export class ReaderAppModule {}
