// auth/auth.service.ts
import { Injectable, UnauthorizedException, ConflictException, NotFoundException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';
import { 
  AuthResponse, 
  ChangePasswordDto, 
  ForgetPasswordDto, 
  LoginDto, 
  RegisterDto, 
  ResetPasswordDto, 
  SocialLoginDto, 
  VerifyForgetPasswordDto,
  RefreshTokenDto,
  OtpLoginDto,
  OtpResponse,
  VerifyOtpDto,
  OtpDto
} from './dto/create-auth.dto';
import { User } from 'src/users/entities/user.entity';
import { Permission } from '../common/enums/enums';
import { jwtConfig } from 'src/config/jwt.config';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';

@Injectable()
export class AuthService {
  constructor(
    @InjectRepository(User)
    private usersRepository: Repository<User>,
    private jwtService: JwtService,
  ) {}

  async register(createUserInput: RegisterDto): Promise<AuthResponse> {
    const existingUser = await this.usersRepository.findOne({ 
      where: { email: createUserInput.email } 
    });

    if (existingUser) {
      throw new ConflictException('User already exists');
    }

    const hashedPassword = await bcrypt.hash(createUserInput.password, 10);
    
    const user = this.usersRepository.create({
      ...createUserInput,
      password: hashedPassword,
      permissions: [createUserInput.permission],
      is_active: true,
    });

    await this.usersRepository.save(user);

    return this.generateAuthResponse(user);
  }

  async login(loginInput: LoginDto): Promise<AuthResponse> {
    const user = await this.usersRepository.findOne({ 
      where: { email: loginInput.email } 
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const isPasswordValid = await bcrypt.compare(loginInput.password, user.password);
    if (!isPasswordValid) {
      throw new UnauthorizedException('Invalid credentials');
    }

    if (!user.is_active) {
      throw new UnauthorizedException('Account is deactivated');
    }

    return this.generateAuthResponse(user);
  }

  async refreshToken(refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    try {
      const payload = this.jwtService.verify(refreshTokenDto.refreshToken, {
        secret: jwtConfig.refreshSecret,
      });

      const user = await this.usersRepository.findOne({ 
        where: { id: payload.sub } 
      });
      if (!user || user.refreshToken !== refreshTokenDto.refreshToken) {
        throw new UnauthorizedException();
      }

      return this.generateAuthResponse(user);
    } catch (error) {
      throw new UnauthorizedException('Invalid refresh token');
    }
  }

  async changePassword(
    userId: number,
    changePasswordInput: ChangePasswordDto,
  ): Promise<CoreMutationOutput> {
    const user = await this.usersRepository.findOne({ 
      where: { id: userId } 
    });
    
    if (!user) {
      throw new NotFoundException('User not found');
    }

    const isOldPasswordValid = await bcrypt.compare(
      changePasswordInput.oldPassword,
      user.password,
    );

    if (!isOldPasswordValid) {
      throw new UnauthorizedException('Old password is incorrect');
    }

    user.password = await bcrypt.hash(changePasswordInput.newPassword, 10);
    await this.usersRepository.save(user);

    return {
      success: true,
      message: 'Password changed successfully',
    };
  }

  async forgetPassword(
    forgetPasswordInput: ForgetPasswordDto,
  ): Promise<CoreMutationOutput> {
    const user = await this.usersRepository.findOne({
      where: { email: forgetPasswordInput.email },
    });

    if (user) {
      // Generate reset token and send email (implement email service)
      const resetToken = this.jwtService.sign(
        { sub: user.id, email: user.email },
        { secret: jwtConfig.secret, expiresIn: '1h' },
      );
      
      // Send email with reset token
      console.log('Reset token:', resetToken);
    }

    return {
      success: true,
      message: 'If your email exists, you will receive a reset link',
    };
  }

  async verifyForgetPasswordToken(
    verifyForgetPasswordTokenInput: VerifyForgetPasswordDto,
  ): Promise<CoreMutationOutput> {
    try {
      const payload = this.jwtService.verify(verifyForgetPasswordTokenInput.token, {
        secret: jwtConfig.secret,
      });

      const user = await this.usersRepository.findOne({ 
        where: { id: payload.sub } 
      });
      if (!user || user.email !== verifyForgetPasswordTokenInput.email) {
        throw new Error('Invalid token');
      }

      return {
        success: true,
        message: 'Token is valid',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid or expired token',
      };
    }
  }

  async resetPassword(
    resetPasswordInput: ResetPasswordDto,
  ): Promise<CoreMutationOutput> {
    try {
      const payload = this.jwtService.verify(resetPasswordInput.token, {
        secret: jwtConfig.secret,
      });

      const user = await this.usersRepository.findOne({ 
        where: { id: payload.sub } 
      });
      if (!user || user.email !== resetPasswordInput.email) {
        throw new Error('Invalid token');
      }

      user.password = await bcrypt.hash(resetPasswordInput.password, 10);
      await this.usersRepository.save(user);

      return {
        success: true,
        message: 'Password reset successful',
      };
    } catch (error) {
      return {
        success: false,
        message: 'Invalid or expired token',
      };
    }
  }

  async socialLogin(socialLoginDto: SocialLoginDto): Promise<AuthResponse> {
    // Implement social login logic based on provider
    let user = await this.usersRepository.findOne({
      where: { email: 'social@example.com' },
    });

    if (!user) {
      user = this.usersRepository.create({
        email: 'social@example.com',
        name: 'Social User',
        permissions: [Permission.CUSTOMER],
        is_active: true,
      });
      await this.usersRepository.save(user);
    }

    return this.generateAuthResponse(user);
  }

  async otpLogin(otpLoginDto: OtpLoginDto): Promise<AuthResponse> {
    // Implement OTP verification logic
    let user = await this.usersRepository.findOne({
      where: { email: otpLoginDto.email || 'otp@example.com' },
    });

    if (!user && otpLoginDto.email) {
      user = this.usersRepository.create({
        email: otpLoginDto.email,
        name: otpLoginDto.name || 'OTP User',
        permissions: [Permission.CUSTOMER],
        is_active: true,
      });
      await this.usersRepository.save(user);
    }

    return this.generateAuthResponse(user);
  }

  async verifyOtpCode(verifyOtpInput: VerifyOtpDto): Promise<CoreMutationOutput> {
    console.log(verifyOtpInput);
    return {
      message: 'success',
      success: true,
    };
  }

  async sendOtpCode(otpInput: OtpDto): Promise<OtpResponse> {
    console.log(otpInput);
    return {
      message: 'success',
      success: true,
      id: '1',
      provider: 'twilio',
      phone_number: otpInput.phone_number,
      is_contact_exist: true,
    };
  }

  async logout(userId: number): Promise<CoreMutationOutput> {
    await this.usersRepository.update(userId, { refreshToken: null });
    return {
      success: true,
      message: 'Logged out successfully',
    };
  }

  async me(userId: number): Promise<User> {
    const user = await this.usersRepository.findOne({
      where: { id: userId },
      relations: ['profile', 'address', 'shops', 'shop'],
    });

    if (!user) {
      throw new NotFoundException('User not found');
    }

    return user;
  }

  private async generateAuthResponse(user: User): Promise<AuthResponse> {
    const payload = { 
      sub: user.id, 
      email: user.email, 
      permissions: user.permissions 
    };

    const accessToken = this.jwtService.sign(payload, {
      secret: jwtConfig.secret,
      expiresIn: jwtConfig.expiresIn,
    });

    const refreshToken = this.jwtService.sign(payload, {
      secret: jwtConfig.refreshSecret,
      expiresIn: jwtConfig.refreshExpiresIn,
    });

    // Save refresh token to database
    user.refreshToken = refreshToken;
    await this.usersRepository.save(user);

    return {
      token: accessToken,
      accessToken,
      refreshToken,
      expiresIn: 900,
      permissions: user.permissions || [],
      role: this.getPrimaryRole(user.permissions),
      user,
    };
  }

  private getPrimaryRole(permissions: Permission[] = []): string {
    if (permissions.includes(Permission.SUPER_ADMIN)) return 'super_admin';
    if (permissions.includes(Permission.STORE_OWNER)) return 'store_owner';
    if (permissions.includes(Permission.STAFF)) return 'staff';
    return 'customer';
  }
}