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
}
