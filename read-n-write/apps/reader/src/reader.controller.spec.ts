import { Test, TestingModule } from '@nestjs/testing';
import { ReaderController } from './reader.controller';
import { ReaderService } from './reader.service';

describe('ReaderController', () => {
  let readerController: ReaderController;

  beforeEach(async () => {
    const app: TestingModule = await Test.createTestingModule({
      controllers: [ReaderController],
      providers: [ReaderService],
    }).compile();

    readerController = app.get<ReaderController>(ReaderController);
  });

  describe('root', () => {
    it('should return "Hello World!"', () => {
      expect(readerController.getHello()).toBe('Hello World!');
    });
  });
});
