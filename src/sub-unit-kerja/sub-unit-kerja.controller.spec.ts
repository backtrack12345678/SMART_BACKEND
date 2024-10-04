import { Test, TestingModule } from '@nestjs/testing';
import { SubUnitKerjaController } from './sub-unit-kerja.controller';
import { SubUnitKerjaService } from './sub-unit-kerja.service';

describe('SubUnitKerjaController', () => {
  let controller: SubUnitKerjaController;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [SubUnitKerjaController],
      providers: [SubUnitKerjaService],
    }).compile();

    controller = module.get<SubUnitKerjaController>(SubUnitKerjaController);
  });

  it('should be defined', () => {
    expect(controller).toBeDefined();
  });
});
