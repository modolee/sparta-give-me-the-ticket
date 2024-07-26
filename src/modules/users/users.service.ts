import bcrypt from 'bcrypt';
import {
  ConflictException,
  Injectable,
  InternalServerErrorException,
  NotFoundException,
} from '@nestjs/common';
import { User } from 'src/entities/users/user.entity';
import { UserUpdateDto } from './dto/user-update.dto';
import { PointLog } from 'src/entities/users/point-log.entity';
import { PointType } from 'src/commons/types/users/point.type';
import { ChargePointDto } from './dto/charge-point.dto';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';

import { InjectRepository } from '@nestjs/typeorm';
import { DataSource, Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    // transaction 사용
    private readonly dataSource: DataSource,

    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PointLog)
    private readonly pointLogRepository: Repository<PointLog>
  ) {}

  // 포인트 내역 조회
  async getPointLog(id: number) {
    try {
      const pointLog = await this.pointLogRepository.find({ where: { userId: id } });

      return pointLog;
    } catch (err) {
      throw new InternalServerErrorException(USER_MESSAGES.USER.POINT.GET_LOG.FAILURE);
    }
  }

  // 예매 목록 조회
  async getTicketList() {
    return;
  }

  // 북마크 목록 조회
  async getBookmarkList() {
    return;
  }

  // 거래 내역 조회
  async getTradeLog() {
    return;
  }

  // 사용자 정보 수정
  async updateUser(id: number, userUpdateDto: UserUpdateDto) {
    const { nickname, profileImg, currentPassword } = userUpdateDto;

    // 사용자 조회
    const user = await this.userRepository.findOne({
      where: { id },
      select: ['id', 'nickname', 'password', 'profileImg'],
    });

    if (!user) {
      throw new NotFoundException(USER_MESSAGES.USER.COMMON.FAILURE.NOT_FOUND);
    }

    // 현재 비밀번호 확인
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordMatch) {
      throw new ConflictException(USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.PASSWORD.MISMATCH);
    }

    /** 닉네임 수정 **/
    if (nickname) {
      const isExistingNickname = await this.userRepository.findOneBy({ nickname });

      // 다른 유저와 닉네임 중복 시
      if (isExistingNickname && isExistingNickname.id !== id) {
        throw new ConflictException(USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.NICKNAME.CONFLICT);
      }

      // 닉네임 업데이트
      user.nickname = nickname;
    }

    /** 프로필 이미지 수정 **/
    if (profileImg) {
      // 프로필 이미지 업데이트
      user.profileImg = profileImg;
    }

    const updateUser = await this.userRepository.save(user);

    return updateUser;
  }

  // 사용자 포인트 충전
  async chargePoint(id: number, chargePointDto: ChargePointDto) {
    const { amount } = chargePointDto;

    // transaction 시작
    const queryRunner = this.dataSource.createQueryRunner();

    await queryRunner.connect();
    await queryRunner.startTransaction();

    try {
      // 사용자 조회
      const user = await queryRunner.manager.findOne(User, { where: { id } });

      if (!user) {
        throw new NotFoundException(USER_MESSAGES.USER.COMMON.FAILURE.NOT_FOUND);
      }

      // 포인트 충전
      user.point += amount;

      // 포인트 충전 로그 기록
      const pointLog = new PointLog();

      pointLog.user = user;
      pointLog.userId = user.id;
      pointLog.price = amount;
      pointLog.description = USER_MESSAGES.USER.POINT.CHARGE.DESCRIPTION;
      pointLog.type = PointType.DEPOSIT;

      // 포인트 로그 업데이트
      await queryRunner.manager.save(PointLog, pointLog);
      // 유저 업데이트
      await queryRunner.manager.save(User, user);

      await queryRunner.commitTransaction();
      await queryRunner.release();

      return user;
    } catch (err) {
      // 실패 시 rollback
      await queryRunner.rollbackTransaction();
      await queryRunner.release();

      throw new InternalServerErrorException(USER_MESSAGES.USER.POINT.CHARGE.FAILURE.FAIL);
    }
  }

  // 회원 탈퇴
  async deleteUser(id: number) {
    try {
      const deleteUser = await this.userRepository.softDelete({ id });

      if (deleteUser.affected === 0) {
        throw new NotFoundException(USER_MESSAGES.USER.COMMON.FAILURE.NOT_FOUND);
      }

      return deleteUser;
    } catch (err) {
      throw new InternalServerErrorException(USER_MESSAGES.USER.COMMON.FAILURE.FAIL);
    }
  }
}
