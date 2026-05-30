import {
  ConflictException,
  Injectable,
  Logger,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { UsersService } from '../users/users.service';
import { RegisterDto } from './dto/register.dto';
import { LoginDto } from './dto/login.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);

  constructor(
    private readonly usersService: UsersService,
    private readonly jwtService: JwtService,
  ) {}

  async register(dto: RegisterDto) {
    const existing = await this.usersService.findByEmail(dto.email);
    if (existing) {
      throw new ConflictException('Email already in use');
    }

    const hashed = await bcrypt.hash(dto.password, 10);
    const user = await this.usersService.create(dto.email, hashed);

    this.logger.log(`User registered: ${user.email}`);

    const token = this.signToken(user.id, user.email);
    return { accessToken: token };
  }

  async login(dto: LoginDto) {
    const user = await this.usersService.findByEmail(dto.email);
    if (!user) {
      this.logger.warn(`Login failed — Invalid credentials: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await bcrypt.compare(dto.password, user.password);
    if (!passwordMatch) {
      this.logger.warn(`Login failed — Invalid credentials: ${dto.email}`);
      throw new UnauthorizedException('Invalid credentials');
    }

    this.logger.log(`User logged in: ${user.email}`);

    const token = this.signToken(user.id, user.email);
    return { accessToken: token };
  }

  private signToken(userId: number, email: string): string {
    return this.jwtService.sign({ sub: userId, email });
  }
}
