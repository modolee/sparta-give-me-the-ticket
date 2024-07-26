import { SetMetadata } from '@nestjs/common';
import { Role } from 'src/modules/users/types/user-role.type';

// 역할(Role)을 위한 커스텀 데코레이터
export const Roles = (...roles: Role[]) => SetMetadata('roles', roles);
