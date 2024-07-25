import { Injectable } from '@nestjs/common';
import { DataFactory, Seeder } from 'nestjs-seeder';
import { Schedule } from 'src/entities/shows/schedule.entity';
import { Show } from 'src/entities/shows/show.entity';
import { DataSource } from 'typeorm';

@Injectable()
export class ShowSeeder implements Seeder {
  constructor(private dataSource: DataSource) {}

  async seed() {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      const shows = DataFactory.createForClass(Show).generate(20);
      const schedules = DataFactory.createForClass(Schedule).generate(20);

      await queryRunner.manager.getRepository(Show).insert(shows);
      await queryRunner.manager.getRepository(Schedule).insert(schedules);

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }

  async drop(): Promise<any> {
    const queryRunner = this.dataSource.createQueryRunner();
    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      await queryRunner.manager.getRepository(Show).delete({});
      await queryRunner.manager.getRepository(Schedule).delete({});

      await queryRunner.commitTransaction();
    } catch (err) {
      await queryRunner.rollbackTransaction();
      throw err;
    } finally {
      await queryRunner.release();
    }
  }
}
