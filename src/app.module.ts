import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configModuleValidationSchema } from 'src/configs/env-validation.config';
import { typeOrmModuleOptions } from 'src/configs/database.config';
import { AuthModule } from './modules/auth/auth.module';
import { UsersModule } from './modules/users/users.module';
import { ShowsModule } from './modules/shows/shows.module';
import { TradesModule } from './modules/trades/trades.module';
import { ImagesModule } from './modules/images/images.module';
import { RedisModule } from './modules/redis/redis.module';
import { SearchModule } from './modules/shows/search/search.module';

@Module({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationSchema,
    }),
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    AuthModule,
    UsersModule,
    ShowsModule,
    TradesModule,
    ImagesModule,
    RedisModule,
    SearchModule,
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {}
