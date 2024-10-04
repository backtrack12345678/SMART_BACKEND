import { Test, TestingModule } from '@nestjs/testing';
import { Helper } from './user.helper';

describe('Helper', () => {
  let provider: Helper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [Helper],
    }).compile();

    provider = module.get<Helper>(Helper);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
