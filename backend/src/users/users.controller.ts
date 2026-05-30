import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';

interface AuthUser {
  id: number;
  email: string;
}

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@CurrentUser() user: AuthUser) {
    const found = await this.usersService.findById(user.id);
    return {
      id: found.id,
      email: found.email,
      createdAt: found.createdAt,
    };
  }
}
