import { Injectable } from '@nestjs/common';

@Injectable()
export class ReaderService {
  getHello(): string {
    return 'Hello, dear reader!';
  }
}
