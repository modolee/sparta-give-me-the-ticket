import { ConfigModule, ConfigService } from '@nestjs/config';
import { TypeOrmModuleAsyncOptions } from '@nestjs/typeorm';
import { SnakeNamingStrategy } from 'typeorm-naming-strategies';

export const typeOrmModuleOptions: TypeOrmModuleAsyncOptions = {
  imports: [ConfigModule],
  inject: [ConfigService],
  useFactory: (ConfigService: ConfigService): {} => ({
    type: 'mysql',
    host: ConfigService.get('DB_HOST'),
    port: ConfigService.get('DB_PORT'),
    username: ConfigService.get('DB_USER'),
    password: ConfigService.get('DB_PASSWORD'),
    database: ConfigService.get('DB_NAME'),
    entities: ['dist/**/*.entity.js'],
    synchronize: ConfigService.get('DB_SYNC'),
    namingStrategy: new SnakeNamingStrategy(),
  }),
};
