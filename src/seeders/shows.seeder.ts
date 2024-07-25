import { Injectable } from '@nestjs/common';
import { DataFactory, Seeder } from 'nestjs-seeder';
import { Schedule } from '../entities/shows/schedule.entity';
import { Show } from '../entities/shows/show.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class ShowSeeder implements Seeder {
  constructor(private dataSource: DataSource) {}

  async seed(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 먼저 Show 데이터 생성 및 삽입
      const shows = DataFactory.createForClass(Show).generate(20);
      shows.forEach((show) => {
        show.user = { id: 1 }; // 적절한 유저 ID 설정
      });
      console.log(shows);

      // Show 데이터 삽입
      await queryRunner.manager.getRepository(Show).insert(shows);

      // 삽입된 Show 데이터 ID를 사용하여 Schedule 데이터 생성
      const showIds = shows.map((show) => show.id);
      const schedules = DataFactory.createForClass(Schedule).generate(20);
      schedules.forEach((schedule) => {
        schedule.user = { id: 1 }; // 적절한 유저 ID 설정
        // Schedule이 참조할 수 있는 Show ID를 설정
        schedule.shows = showIds.slice(0, 2).map((id) => ({ id })); // 예시로 첫 두 개의 Show를 참조
      });
      console.log(schedules);

      // Schedule 데이터 삽입
      await queryRunner.manager.getRepository(Schedule).insert(schedules);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async drop(): Promise<void> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 데이터 삭제
      await queryRunner.manager.getRepository(Schedule).delete({});
      await queryRunner.manager.getRepository(Show).delete({});

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
