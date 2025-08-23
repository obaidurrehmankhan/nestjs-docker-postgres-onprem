import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { DataSourceOptions } from 'typeorm';
import { HealthController } from './health.controller';

@Module({
  imports: [
    TypeOrmModule.forRootAsync({
      useFactory: (): DataSourceOptions => {
        const url = process.env.DATABASE_URL;
        if (!url) throw new Error('DATABASE_URL is not set');

        const useSsl =
          (process.env.DATABASE_SSL || '').toLowerCase() === 'true' ||
          process.env.NODE_ENV === 'production';

        return {
          type: 'postgres',
          url,
          ssl: useSsl ? { rejectUnauthorized: false } : false,
          autoLoadEntities: true,
          synchronize: false,
          migrations: ['dist/migrations/*.js'],
        } as DataSourceOptions;
      },
    }),
  ],
  controllers: [HealthController],
})
export class AppModule { }
