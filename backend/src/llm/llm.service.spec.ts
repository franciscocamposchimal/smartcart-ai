import { Test, TestingModule } from '@nestjs/testing';
import { ConfigService } from '@nestjs/config';
import { LlmService } from './llm.service';

describe('LlmService', () => {
  let service: LlmService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        LlmService,
        {
          provide: ConfigService,
          useValue: {
            get: jest.fn((key: string, defaultVal?: string) => {
              if (key === 'GEMINI_API_KEY') return undefined;
              if (key === 'GEMINI_MODEL') return 'gemini-1.5-flash';
              return defaultVal;
            }),
          },
        },
      ],
    }).compile();

    service = module.get<LlmService>(LlmService);
  });

  it('should be defined', () => {
    expect(service).toBeDefined();
  });

  it('should throw when GEMINI_API_KEY not set', async () => {
    await expect(service.identifyProduct('1234567890')).rejects.toThrow(
      'LLM service not configured',
    );
  });
});
