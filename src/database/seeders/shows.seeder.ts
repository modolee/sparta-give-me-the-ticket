import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/users/user.entity';
import { DataFactory } from 'nestjs-seeder';
import { Show } from 'src/entities/shows/show.entity';

@Injectable()
export class ShowSeeder implements Seeder {
  constructor(
    @InjectRepository(Show)
    private readonly showRepository: Repository<Show>
  ) {}

  // 20개를 생성하겠습니다.
  seed(): Promise<any> {
    const shows = DataFactory.createForClass(Show).generate(20);

    return this.showRepository.insert(shows);
  }

  // 더미데이터를 지우겠다는 의미
  drop(): Promise<any> {
    return this.showRepository.delete({});
  }
}
