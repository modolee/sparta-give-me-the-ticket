import { TypeOrmModule } from '@nestjs/typeorm';
import { seeder } from 'nestjs-seeder';
import { Show } from './entities/shows/show.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { ShowSeeder } from './seeders/shows.seeder';
import { ConfigModule, ConfigService } from '@nestjs/config';
import { User } from './entities/users/user.entity';
import { ScheduleSeeder } from './seeders/schedule.seeder';
import { UserSeeder } from './seeders/user.seeder';

seeder({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
    }),
    TypeOrmModule.forRootAsync({
      imports: [ConfigModule],
      useFactory: (configService: ConfigService) => ({
        type: 'mysql',
        host: configService.get('DB_HOST'),
        port: configService.get('DB_PORT'),
        username: configService.get('DB_USER'),
        password: configService.get('DB_PASSWORD'),
        database: configService.get('DB_NAME'),
        entities: [Show, Schedule, User],
        synchronize: configService.get('DB_SYNC'),
      }),
      inject: [ConfigService],
    }),
    TypeOrmModule.forFeature([Show, Schedule, User]),
  ],
}).run([UserSeeder, ScheduleSeeder, ShowSeeder]);
