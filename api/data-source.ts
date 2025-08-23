// data-source.ts
import 'reflect-metadata';
import { DataSource } from 'typeorm';
import { Todo } from './src/todos/todo.entity';
import * as dotenv from 'dotenv';

// Load environment variables (DATABASE_URL, etc.)
dotenv.config();

export const AppDataSource = new DataSource({
    type: 'postgres',
    // We rely on DATABASE_URL for Docker & CI portability
    url: process.env.DATABASE_URL,

    // Entities define DB tables (Todo etc.)
    entities: [Todo],

    // Path to migration files (both dev .ts and prod .js after build)
    migrations: ['dist/migrations/*.js', 'src/migrations/*.ts'],

    synchronize: false, // ❌ Never auto-sync in prod, always use migrations
    logging: true, // helpful in CI logs
});
