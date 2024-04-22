import { Module } from '@nestjs/common';
import { AppDefaultCommand } from './app.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { ReaderModule } from './reader/reader.module';
import { AppService } from './app.service';

@Module({
  imports: [ReaderModule, CqrsModule.forRoot()],
  providers: [AppDefaultCommand, AppService],
})
export class AppModule {}
