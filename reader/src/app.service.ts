import { Injectable } from '@nestjs/common';

@Injectable()
export class ReaderAppService {
  getHello(): string {
    return 'Hello, my dear reader!!';
  }
}
