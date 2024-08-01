import IORedis from 'ioredis';
import { REDIS } from '../../commons/constants/server.constants';

export const redisConnection = new IORedis({
  host: REDIS.HOST, // Redis 서버의 호스트 이름
  port: Number(REDIS.PORT), // Redis 서버의 포트
  password: REDIS.PASSWORD, // Redis 서버의 비밀번호 (선택사항)
  db: 0, // 사용할 Redis 데이터베이스 번호 (기본값: 0)
});
