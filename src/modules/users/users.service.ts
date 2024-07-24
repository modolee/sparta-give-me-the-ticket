import bcrypt from 'bcrypt';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { User } from 'src/entities/users/user.entity';
import { UserUpdateDto } from './dto/user-update.dto';
import { USER_MESSAGES } from 'src/commons/constants/users/user-message.constant';
import { USER_CONSTANT } from 'src/commons/constants/users/user.constant';

import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>
  ) {}

  // 포인트 내역 조회
  async getPointLog() {
    return;
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
    const { email, nickname, profileImg, currentPassword, changedPassword } = userUpdateDto;

    // 사용자 조회
    const user = await this.userRepository.findOneBy({ id });

    if (!user) {
      throw new NotFoundException({
        message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.USER_NOT_FOUND,
      });
    }

    /** 이메일 수정 **/
    if (email) {
      const isExistingEmail = await this.userRepository.findOneBy({ email });

      // 다른 유저와 이메일 중복 시
      if (isExistingEmail && isExistingEmail.id !== id) {
        throw new ConflictException({
          message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.EMAIL.CONFLICT,
        });
      }

      // 이메일 업데이트
      user.email = email;
    }

    /** 닉네임 수정 **/
    if (nickname) {
      const isExistingNickname = await this.userRepository.findOneBy({ nickname });

      // 다른 유저와 닉네임 중복 시
      if (isExistingNickname && isExistingNickname.id !== id) {
        throw new ConflictException({
          message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.NICKNAME.CONFLICT,
        });
      }

      // 닉네임 업데이트
      user.nickname = nickname;
    }

    /** 프로필 이미지 수정 **/
    if (profileImg) {
      // 프로필 이미지 업데이트
      user.profileImg = profileImg;
    }

    /** 비밀번호 수정 **/
    // 현재 비밀번호 확인
    const isPasswordMatch = await bcrypt.compare(currentPassword, user.password);

    if (!isPasswordMatch) {
      throw new ConflictException({
        message: USER_MESSAGES.USER.USERINFO.UPDATE.FAILURE.PASSWORD.MISMATCH,
      });
    }

    // 변경된 비밀번호 해시화
    const hashedPassword = await bcrypt.hash(
      changedPassword,
      USER_CONSTANT.COMMON.HASH_SALT_ROUNDS
    );

    // 비밀번호 업데이트
    user.password = hashedPassword;

    const updateUser = await this.userRepository.save(user);

    return updateUser;
  }

  // 사용자 포인트 충전
  async chargePoint() {
    return;
  }

  // 회원 탈퇴
  async deleteUser() {
    return;
  }
}
