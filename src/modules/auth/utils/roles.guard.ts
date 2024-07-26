import { CanActivate, ExecutionContext, ForbiddenException, Injectable } from '@nestjs/common';
import { Reflector } from '@nestjs/core';
import { AuthGuard } from '@nestjs/passport';
import { Role } from 'src/modules/users/types/user-role.type';

/**
 * 역할 구분이 필요한 컨트롤러부분에 다음과 같이 작성
 * @UseGuards(RolesGuard)
 * @Roles(Role.ADMIN)
 * @Post()
 */

@Injectable()
export class RolesGuard extends AuthGuard('jwt') implements CanActivate {
  constructor(private readonly reflector: Reflector) {
    super();
  }

  // 로그인한 사용자가 해당 역할에 맞는지 확인
  async canActivate(context: ExecutionContext): Promise<boolean> {
    // jwt 검증이 통과 되었는지 확인
    const authenticated = await super.canActivate(context);
    if (!authenticated) return false;

    // @Roles(Role.Admin) -> 'roles'에 [Role.Admin] 배열이 담겨 있음
    // 즉, requiredRoles에 [Role.Admin] 배열이 들어감
    // reflector를 통해서 메타데이터를 탐색 후 'roles' 키의 값을 가져옴
    const requireRoles = this.reflector.getAllAndOverride<Role[]>('roles', [
      context.getHandler(),
      context.getClass(),
    ]);

    const { user } = context.switchToHttp().getRequest();

    // 사용자의 역할이 requireRoles 배열에 해닿하는지 확인
    if (!requireRoles.some((role) => user.role === role)) {
      throw new ForbiddenException('접근할 권한이 없습니다.');
    }

    return true;
  }
}
