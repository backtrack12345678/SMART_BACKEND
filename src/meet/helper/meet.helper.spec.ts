import { Test, TestingModule } from '@nestjs/testing';
import { MeetHelper } from './meet.helper';

describe('Helper', () => {
  let provider: MeetHelper;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [MeetHelper],
    }).compile();

    provider = module.get<MeetHelper>(MeetHelper);
  });

  it('should be defined', () => {
    expect(provider).toBeDefined();
  });
});
