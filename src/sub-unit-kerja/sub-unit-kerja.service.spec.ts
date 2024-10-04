import { Test, TestingModule } from '@nestjs/testing';
import { SubUnitKerjaService } from './sub-unit-kerja.service';

describe('SubUnitKerjaService', () => {
  let service: SubUnitKerjaService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [SubUnitKerjaService],
    }).compile();

    service = module.get<SubUnitKerjaService>(SubUnitKerjaService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });
});
