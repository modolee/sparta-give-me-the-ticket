import { Module } from '@nestjs/common';
import { AuthController } from './auth.controller';
import { AuthService } from './auth.service';
import { PassportModule } from '@nestjs/passport';
import { JwtModule } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { UsersModule } from '../users/users.module';
import { LocalStrategy } from './strategies/local.strategy';
import { JwtStrategy } from './strategies/jwt.strategy';
import { TypeOrmModule } from '@nestjs/typeorm';
import { User } from 'src/entities/users/user.entity';
import { RefreshTokenStrategy } from './strategies/refresh-token.strategy';
import { KakaoStrategy } from './strategies/kakao.strategy';

@Module({
  imports: [
    TypeOrmModule.forFeature([User]),
    PassportModule.register({
      defaultStrategy: 'jwt',
      session: false,
    }),

    JwtModule.registerAsync({
      useFactory: (config: ConfigService) => ({
        secret: config.get<string>('JWT_SECRET_KEY'),
        signOptions: { expiresIn: '12h' },
      }),
      inject: [ConfigService],
    }),
    UsersModule,
  ],
  controllers: [AuthController],
  providers: [AuthService, LocalStrategy, JwtStrategy, RefreshTokenStrategy, KakaoStrategy],
  exports: [AuthService],
})
export class AuthModule {}
