import { Test, TestingModule } from '@nestjs/testing';
import { ConflictException, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import * as bcrypt from 'bcryptjs';
import { AuthService } from './auth.service';
import { UsersService } from '../users/users.service';

const mockUser = { id: 1, email: 'test@smartex.com', password: 'hashed' };

const mockUsersService = {
  findByEmail: jest.fn(),
  create: jest.fn(),
};

const mockJwtService = {
  sign: jest.fn().mockReturnValue('mock-token'),
};

describe('AuthService', () => {
  let service: AuthService;

  beforeEach(async () => {
    const module: TestingModule = await Test.createTestingModule({
      providers: [
        AuthService,
        { provide: UsersService, useValue: mockUsersService },
        { provide: JwtService, useValue: mockJwtService },
      ],
    }).compile();

    service = module.get<AuthService>(AuthService);
    jest.clearAllMocks();
  });

  describe('register', () => {
    it('should register a new user and return accessToken', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);

      const result = await service.register({
        email: 'test@smartex.com',
        password: 'Test123!',
      });

      expect(result).toHaveProperty('accessToken', 'mock-token');
      expect(mockUsersService.create).toHaveBeenCalledTimes(1);
    });

    it('should hash the password before saving', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);
      mockUsersService.create.mockResolvedValue(mockUser);

      await service.register({
        email: 'test@smartex.com',
        password: 'Test123!',
      });

      const [, hashedPassword] = mockUsersService.create.mock.calls[0];
      expect(hashedPassword).not.toBe('Test123!');
      expect(await bcrypt.compare('Test123!', hashedPassword)).toBe(true);
    });

    it('should throw ConflictException if email already in use', async () => {
      mockUsersService.findByEmail.mockResolvedValue(mockUser);

      await expect(
        service.register({ email: 'test@smartex.com', password: 'Test123!' }),
      ).rejects.toThrow(ConflictException);
    });
  });

  describe('login', () => {
    it('should login and return accessToken', async () => {
      const hashed = await bcrypt.hash('Test123!', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hashed,
      });

      const result = await service.login({
        email: 'test@smartex.com',
        password: 'Test123!',
      });

      expect(result).toHaveProperty('accessToken', 'mock-token');
    });

    it('should throw UnauthorizedException if user not found', async () => {
      mockUsersService.findByEmail.mockResolvedValue(null);

      await expect(
        service.login({ email: 'unknown@smartex.com', password: 'Test123!' }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should throw UnauthorizedException if password is wrong', async () => {
      const hashed = await bcrypt.hash('correct-password', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hashed,
      });

      await expect(
        service.login({
          email: 'test@smartex.com',
          password: 'wrong-password',
        }),
      ).rejects.toThrow(UnauthorizedException);
    });

    it('should sign JWT with correct payload', async () => {
      const hashed = await bcrypt.hash('Test123!', 10);
      mockUsersService.findByEmail.mockResolvedValue({
        ...mockUser,
        password: hashed,
      });

      await service.login({ email: 'test@smartex.com', password: 'Test123!' });

      expect(mockJwtService.sign).toHaveBeenCalledWith({
        sub: mockUser.id,
        email: mockUser.email,
      });
    });
  });
});
