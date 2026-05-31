import { Test, TestingModule } from '@nestjs/testing';
import { DataSource } from 'typeorm';
import { HealthController } from './health.controller';

describe('HealthController', () => {
  let controller: HealthController;
  const dataSource = {
    query: jest.fn<Promise<unknown[]>, [string]>(),
  };

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      controllers: [HealthController],
      providers: [{ provide: DataSource, useValue: dataSource }],
    }).compile();

    controller = module.get<HealthController>(HealthController);
    jest.clearAllMocks();
    dataSource.query.mockResolvedValue([{ '?column?': 1 }]);
  });

  it('should return API and database health status', async () => {
    const result = await controller.check();

    expect(dataSource.query).toHaveBeenCalledWith('SELECT 1');
    expect(result.status).toBe('ok');
    expect(result.database).toBe('up');
    expect(result.timestamp).toEqual(expect.any(String));
  });
});
