import { Module } from '@nestjs/common';
import { AppDefaultCommand } from './app.controller';
import { CqrsModule } from '@nestjs/cqrs';
import { _Template_Module } from './_template_/_template_.module';

@Module({
  imports: [_Template_Module, CqrsModule.forRoot()],
  providers: [AppDefaultCommand],
})
export class AppModule {}
