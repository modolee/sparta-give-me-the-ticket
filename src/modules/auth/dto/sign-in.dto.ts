import { PickType } from '@nestjs/swagger';
import { User } from 'src/entities/users/user.entity';

export class SignInDto extends PickType(User, ['email', 'password']) {}
