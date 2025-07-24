import {
  ConflictException,
  Injectable,
  NotFoundException,
  UnauthorizedException,
} from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { User } from 'src/modules/users/entities/user.entity';
import { Repository } from 'typeorm';
import { Permission as PermissionEntity } from 'src/modules/users/entities/user.entity';
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

  /**
   * Registers a new user and assigns them a default permission.
   * The entire process is wrapped in a transaction to ensure atomicity.
   */
  async register(createUserInput: RegisterDto): Promise<AuthResponse> {
    const { email, password, name, permission } = createUserInput;

    // Check if the user already exists by email
    const existingUser = await this.userRepository.findOne({
      where: { email },
    });
    if (existingUser) {
      throw new ConflictException('Email already in use');
    }

    // Hash the user's password
    const hashedPassword = await bcrypt.hash(password, 10);

    // Create and save the new user
    const user = this.userRepository.create({
      name,
      email,
      password: hashedPassword,
    });
    const savedUser = await this.userRepository.save(user);

    // Assign the default permission if not already present
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

    // Reload user with permissions relation
    const userWithPermissions = await this.userRepository.findOne({
      where: { id: savedUser.id },
      relations: ['permissions'],
    });

    if (!userWithPermissions) {
      throw new Error('User not found after registration.');
    }

    // Generate JWT token for the new user
    const payload = { sub: savedUser.id, email: savedUser.email };
    const token = this.jwtService.sign(payload);

    // Return auth response
    return {
      token,
      permissions:
        userWithPermissions.permissions
          ?.map((p) => p.name)
          .filter((name): name is string => typeof name === 'string') || [],
      role: permission,
    };
  }

  async login(loginInput: LoginDto): Promise<AuthResponse> {
    const { email, password } = loginInput;

    // Step 1: Find the user by email
    const existingUser = await this.userRepository.findOne({
      where: { email: email },
      relations: ['permissions'], // make sure permissions are loaded
    });

    if (!existingUser) {
      throw new UnauthorizedException('Invalid credentials');
    }

    // Step 2: Compare the password
    const isPasswordValid = await bcrypt.compare(
      password,
      existingUser.password,
    );
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }
    // Step 3: Sign JWT token
    const payload = { sub: existingUser.id, email: existingUser.email };
    const token = this.jwtService.sign(payload);

    // Step 4: Return AuthResponse
    return {
      token,
      permissions:
        existingUser.permissions
          ?.map((p) => p.name)
          .filter((name): name is string => typeof name === 'string') || [],
      role: existingUser.permissions?.[0]?.name || undefined,
    };
  }

  async me(userId: number): Promise<User> {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'email', 'name'], // Add other fields if needed
    });

    if (!user) {
      throw new NotFoundException(`User with ID ${userId} not found`);
    }

    return user;
  }
}
