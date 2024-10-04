import { Test, TestingModule } from '@nestjs/testing';
import { GolonganController } from './golongan.controller';
import { GolonganService } from './golongan.service';

describe('GolonganController', () => {
  let controller: GolonganController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [GolonganController],
      providers: [GolonganService],
    }).compile();

    controller = module.get<GolonganController>(GolonganController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
