import { Controller, Get, ServiceUnavailableException } from '@nestjs/common';
import { DataSource } from 'typeorm';

@Controller()
export class HealthController {
    constructor(private readonly dataSource: DataSource) { }

    @Get('/health')
    health() {
        return { status: 'ok' };
    }

    @Get('/ready')
    async ready() {
        try {
            await this.dataSource.query('SELECT 1');
            return { status: 'ready' };
        } catch {
            throw new ServiceUnavailableException({
                status: 'not-ready',
                reason: 'DB check failed',
            });
        }
    }
}
