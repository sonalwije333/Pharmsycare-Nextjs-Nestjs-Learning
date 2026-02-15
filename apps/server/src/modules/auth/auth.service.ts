import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from '../users/entities/user.entity';
import { Repository } from 'typeorm';
import { Permission as PermissionEntity } from '../users/entities/user.entity';
import { AuthResponse, LoginDto, RegisterDto } from './dto/create-auth.dto';
import * as bcrypt from 'bcrypt';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,
    @InjectRepository(PermissionEntity)
    private readonly permissionRepository: Repository<PermissionEntity>,
  ) {}

  async register(createUserInput: RegisterDto): Promise<AuthResponse> {
    const { email, password, name, permission } = createUserInput;

    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    const hashedPassword = await bcrypt.hash(password, 10);
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);

    const existingPermission = await this.permissionRepository.findOne({
      where: { user: savedUser, name: permission },
    });

    if (!existingPermission) {
      const newPermission = this.permissionRepository.create({
        name: permission,
        user: savedUser,
      });
      await this.permissionRepository.save(newPermission);
    }

    const userWithPermissions = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['permissions'],
    });

    if (!userWithPermissions) {
      throw new Error('User not found after registration.');
    }

    const payload = { sub: savedUser.id, email: savedUser.email };
    const token = this.jwtService.sign(payload);

    return {
      token,
      permissions:
        userWithPermissions.permissions
          ?.map((p) => p.name)
          .filter((name): name is string => typeof name === 'string') || [],
      role: permission,
      user: {
        id: savedUser.id,
        name: savedUser.name,
        email: savedUser.email,
      },
    };
  }

  async login(loginInput: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginInput;

    const existingUser = await this.userRepository.findOne({
      where: { email },
      relations: ['permissions'],
    });

    if (!existingUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: existingUser.id, email: existingUser.email };
    const token = this.jwtService.sign(payload);

    return {
      token,
      permissions:
        existingUser.permissions
          ?.map((p) => p.name)
          .filter((name): name is string => typeof name === 'string') || [],
      role: existingUser.permissions?.[0]?.name || undefined,
      user: {
        id: existingUser.id,
        name: existingUser.name,
        email: existingUser.email,
      },
    };
  }

  async me(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      relations: ['permissions'],
      select: ['id', 'email', 'name'],
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }
  async socialLogin(dto: any): Promise<AuthResponse> {
    const { email, name } = dto;

    let user = await this.userRepository.findOne({
      where: { email },
      relations: ['permissions'],
    });

    if (!user) {
      user = this.userRepository.create({
        email,
        name,
        password: '', // no password for social login
      });
      user = await this.userRepository.save(user);
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      token,
      permissions: [],
      role: 'user',
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
  async otpLogin(dto: any): Promise<AuthResponse> {
    const user = await this.userRepository.findOne({
      where: { email: dto.email },
      relations: ['permissions'],
    });

    if (!user) {
      throw new UnauthorizedException('User not found');
    }

    const payload = { sub: user.id, email: user.email };
    const token = this.jwtService.sign(payload);

    return {
      token,
      permissions: [],
      role: user.permissions?.[0]?.name,
      user: {
        id: user.id,
        name: user.name,
        email: user.email,
      },
    };
  }
  async sendOtpCode(dto: any) {
    return { success: true, message: 'OTP sent successfully' };
  }
  async verifyOtpCode(dto: any) {
    return { success: true, message: 'OTP verified successfully' };
  }
  async forgetPassword(dto: any) {
    return { success: true, message: 'Password reset link sent' };
  }
  async verifyForgetPasswordToken(dto: any) {
    return { success: true, message: 'Token verified successfully' };
  }
  async resetPassword(dto: any) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);

    await this.userRepository.update(
      { email: dto.email },
      { password: hashedPassword },
    );

    return { success: true, message: 'Password reset successfully' };
  }
  async changePassword(dto: any, userId: number) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isMatch = await bcrypt.compare(dto.oldPassword, user.password);
    if (!isMatch) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    user.password = await bcrypt.hash(dto.newPassword, 10);
    await this.userRepository.save(user);

    return { success: true, message: 'Password changed successfully' };
  }
  async addWalletPoints(dto: any, userId: number) {
    return {
      success: true,
      message: `Added ${dto.points} points to user ${userId}`,
    };
  }
}
