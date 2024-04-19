import { Controller, Get } from '@nestjs/common';
import { ReaderService } from './reader.service';

@Controller()
export class ReaderController {
  constructor(private readonly readerService: ReaderService) {}

  @Get()
  getHello(): string {
    return this.readerService.getHello();
  }
}
