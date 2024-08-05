import { TypeOrmModule } from '@nestjs/typeorm';
import { seeder } from 'nestjs-seeder';
import { Show } from './entities/shows/show.entity';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { ShowSeeder } from './seeders/shows.seeder';
import { ConfigModule } from '@nestjs/config';
import { User } from './entities/users/user.entity';
import { SchedulesSeeder } from './seeders/schedules.seeder';
import { UserSeeder } from './seeders/user.seeder';
import { typeOrmModuleOptions } from './configs/database.config';
import { configModuleValidationSchema } from './configs/env-validation.config';

seeder({
  imports: [
    ConfigModule.forRoot({
      isGlobal: true,
      validationSchema: configModuleValidationSchema,
    }),

    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    TypeOrmModule.forFeature([Show, User, Schedule]),
  ],
}).run([UserSeeder, ShowSeeder, SchedulesSeeder]);
