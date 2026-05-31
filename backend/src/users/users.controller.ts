import { Controller, Get } from '@nestjs/common';
import { CurrentUser } from '../auth/decorators/current-user.decorator';
import type { JwtUser } from '../auth/decorators/current-user.decorator';
import { UsersService } from './users.service';

@Controller('users')
export class UsersController {
  constructor(private readonly usersService: UsersService) {}

  @Get()
  async getProfile(@CurrentUser() user: JwtUser) {
    const found = await this.usersService.findById(user.id);
    return {
      id: found.id,
      email: found.email,
      createdAt: found.createdAt,
    };
  }
}
