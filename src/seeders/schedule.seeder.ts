import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { DataFactory } from 'nestjs-seeder';
import { Schedule } from 'src/entities/shows/schedule.entity';

@Injectable()
export class ScheduleSeeder implements Seeder {
  constructor(
    @InjectRepository(Schedule)
    private readonly userRepository: Repository<Schedule>
  ) {}

  // 20개를 생성하겠습니다.
  seed(): Promise<any> {
    const schedules = DataFactory.createForClass(Schedule).generate(20);

    return this.userRepository.insert(schedules);
  }

  // 더미데이터를 지우겠다는 의미
  drop(): Promise<any> {
    return this.userRepository.delete({});
  }
}
