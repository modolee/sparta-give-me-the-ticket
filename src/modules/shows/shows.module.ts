import { Module } from '@nestjs/common';
import { ShowsController } from './shows.controller';
import { ShowsService } from './shows.service';
import { TypeOrmModule } from '@nestjs/typeorm';
import { Show } from 'src/entities/shows/show.entity';
@Module({
  imports: [TypeOrmModule.forFeature([Show])],
  controllers: [ShowsController],
  providers: [ShowsService],
  exports: [TypeOrmModule],
})
export class ShowsModule {}
