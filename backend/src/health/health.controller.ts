import { Controller, Get } from '@nestjs/common';
import { DataSource } from 'typeorm';
import { Public } from '../auth/decorators/public.decorator';

type HealthResponse = {
  status: 'ok';
  database: 'up';
  timestamp: string;
};

@Controller('health')
export class HealthController {
  constructor(private readonly dataSource: DataSource) {}

  @Public()
  @Get()
  async check(): Promise<HealthResponse> {
    await this.dataSource.query('SELECT 1');

    return {
      status: 'ok',
      database: 'up',
      timestamp: new Date().toISOString(),
    };
  }
}
