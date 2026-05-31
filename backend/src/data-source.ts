import 'reflect-metadata';
import { DataSource } from 'typeorm';
import * as dotenv from 'dotenv';

dotenv.config();

function getRequiredEnv(name: string): string {
  const value = process.env[name];
  if (!value) {
    throw new Error(`${name} is required`);
  }
  return value;
}

function getRequiredNumberEnv(name: string): number {
  const value = Number(getRequiredEnv(name));
  if (Number.isNaN(value)) {
    throw new Error(`${name} must be a number`);
  }
  return value;
}

export const AppDataSource = new DataSource({
  type: 'postgres',
  host: getRequiredEnv('DB_HOST'),
  port: getRequiredNumberEnv('DB_PORT'),
  username: getRequiredEnv('DB_USER'),
  password: getRequiredEnv('DB_PASSWORD'),
  database: getRequiredEnv('DB_NAME'),
  entities: [__dirname + '/**/*.entity{.ts,.js}'],
  migrations: [__dirname + '/migrations/*{.ts,.js}'],
  synchronize: false,
});
