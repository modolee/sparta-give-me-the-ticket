import { MiddlewareConsumer, Module } from '@nestjs/common';
import { AppController } from './app.controller';
import { AppService } from './app.service';
import { ConfigModule } from '@nestjs/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { configModuleValidationSchema } from 'src/configs/env-validation.config';
import { typeOrmModuleOptions } from 'src/configs/database.config';
import { AuthModule } from './auth/auth.module';
import { UsersModule } from './users/users.module';
import { ShowsModule } from './shows/shows.module';
import { TradesModule } from './trades/trades.module';
import { ImagesModule } from './images/images.module';

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
  ],
  controllers: [AppController],
  providers: [AppService],
})
export class AppModule {
  configure(consumer: MiddlewareConsumer) {
    // 전역 프리픽스 설정
    consumer.apply().forRoutes('/');
  }
}
