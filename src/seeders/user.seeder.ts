import { Injectable } from '@nestjs/common';
import { Seeder } from 'nestjs-seeder';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { User } from 'src/entities/users/user.entity';
import { DataFactory } from 'nestjs-seeder';

@Injectable()
export class UserSeeder implements Seeder {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  // 20개를 생성하겠습니다.
  seed(): Promise<any> {
    const users = DataFactory.createForClass(User).generate(20);

    return this.userRepository.insert(users);
  }

  // 더미데이터를 지우겠다는 의미
  drop(): Promise<any> {
    return this.userRepository.delete({});
  }
}
