import { Module } from '@nestjs/common';
import { AppDefaultCommand } from './app.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { ReaderModule } from './reader/reader.module';

@Module({
  imports: [ReaderModule, CqrsModule.forRoot()],
  providers: [AppDefaultCommand],
})
export class AppModule {}
