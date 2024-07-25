import 'dotenv/config';
import { TypeOrmModule } from '@nestjs/typeorm';
import { seeder } from 'nestjs-seeder';
import { Show } from './entities/shows/show.entity';
import { ShowSeeder } from './seeders/shows.seeder';
import { typeOrmModuleOptions } from './configs/database.config';
seeder({
  imports: [TypeOrmModule.forRootAsync(typeOrmModuleOptions), TypeOrmModule.forFeature([Show])],
}).run([ShowSeeder]);