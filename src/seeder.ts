import 'dotenv/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { seeder } from 'nestjs-seeder';
import { Show } from './entities/shows/show.entity';
import { ShowSeeder } from './seeders/shows.seeder';
import { typeOrmModuleOptions } from './configs/database.config';
import { User } from './entities/users/user.entity';
seeder({
  imports: [
    TypeOrmModule.forRootAsync(typeOrmModuleOptions),
    TypeOrmModule.forFeature([Show, User]),
  ],
}).run([ShowSeeder]);
