import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import {
  AuthResponse,
  ChangePasswordDto,
  ForgetPasswordDto,
  LoginDto,
  OtpDto,
  OtpLoginDto,
  RegisterDto,
  ResetPasswordDto,
  SocialLoginDto,
  VerifyForgetPasswordDto,
  VerifyOtpDto,
} from './dto/create-auth.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import {Roles} from "../../common/decorators/role.decorator";
import {PermissionType} from "../../common/enums/PermissionType.enum";

@ApiTags('Authentication')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({
    summary: 'Register a new user',
    description: 'Creates a new user account with the provided details.',
  })
  @ApiOkResponse({
    description: 'User successfully registered',
    type: AuthResponse,
  })
  createAccount(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @ApiOperation({
    summary: 'Login to system',
    description: 'Authenticates user and returns JWT token.',
  })
  @ApiOkResponse({
    description: 'User successfully logged in',
    type: AuthResponse,
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @Post('social-login-token')
  @ApiOperation({
    summary: 'Social login',
    description: 'Authenticates user via social media and returns JWT token.',
  })
  @ApiOkResponse({
    description: 'User successfully logged in via social media',
    type: AuthResponse,
  })
  socialLogin(@Body() socialLoginDto: SocialLoginDto) {
    return this.authService.socialLogin(socialLoginDto);
  }

  @Post('otp-login')
  @ApiOperation({
    summary: 'OTP login',
    description: 'Authenticates user using OTP and returns JWT token.',
  })
  @ApiOkResponse({
    description: 'User successfully logged in via OTP',
    type: AuthResponse,
  })
  otpLogin(@Body() otpLoginDto: OtpLoginDto) {
    return this.authService.otpLogin(otpLoginDto);
  }

  @Post('send-otp-code')
  @ApiOperation({
    summary: 'Send OTP code',
    description: 'Sends OTP code to user for verification.',
  })
  @ApiOkResponse({
    description: 'OTP code sent successfully',
  })
  sendOtpCode(@Body() otpDto: OtpDto) {
    return this.authService.sendOtpCode(otpDto);
  }

  @Post('verify-otp-code')
  @ApiOperation({
    summary: 'Verify OTP code',
    description: 'Verifies the OTP code sent to user.',
  })
  @ApiOkResponse({
    description: 'OTP code verified successfully',
  })
  verifyOtpCode(@Body() verifyOtpDto: VerifyOtpDto) {
    return this.authService.verifyOtpCode(verifyOtpDto);
  }

  @Post('forget-password')
  @ApiOperation({
    summary: 'Forget password',
    description: 'Initiates password reset process.',
  })
  @ApiOkResponse({
    description: 'Password reset email sent',
  })
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto) {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @Post('verify-forget-password-token')
  @ApiOperation({
    summary: 'Verify forget password token',
    description: 'Verifies the password reset token.',
  })
  @ApiOkResponse({
    description: 'Token verified successfully',
  })
  verifyForgetPassword(
    @Body() verifyForgetPasswordDto: VerifyForgetPasswordDto,
  ) {
    return this.authService.verifyForgetPasswordToken(verifyForgetPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({
    summary: 'Reset password',
    description: 'Resets user password with valid token.',
  })
  @ApiOkResponse({
    description: 'Password reset successfully',
  })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto) {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @UseGuards(JwtAuthGuard)
  @Post('change-password')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Change password',
    description: 'Changes user password (requires authentication).',
  })
  @ApiOkResponse({
    description: 'Password changed successfully',
  })
  changePassword(@Body() changePasswordDto: ChangePasswordDto, @Req() req) {
    return this.authService.changePassword(changePasswordDto, req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Get current user profile',
    description: 'Returns the profile of the currently authenticated user.',
  })
  @ApiOkResponse({
    description: 'Current user profile',
    type: AuthResponse,
  })
  async me(@Req() req) {
    return this.authService.me(req.user.id);
  }

  @UseGuards(JwtAuthGuard)
  @Post('logout')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Logout user',
    description: 'Invalidates the current user session.',
  })
  @ApiOkResponse({
    description: 'User successfully logged out',
    type: Boolean,
  })
  async logout(): Promise<boolean> {
    return true;
  }

  @UseGuards(JwtAuthGuard)
  @Post('add-points')
  @Roles(PermissionType.SUPER_ADMIN, PermissionType.STORE_OWNER)
  @ApiBearerAuth('access-token')
  @ApiOperation({
    summary: 'Add wallet points',
    description: 'Adds points to user wallet.',
  })
  @ApiOkResponse({
    description: 'Points added successfully',
  })
  addWalletPoints(@Body() addPointsDto: any, @Req() req) {
    return this.authService.addWalletPoints(addPointsDto, req.user.id);
  }

  @Post('contact-us')
  @ApiOperation({
    summary: 'Contact us',
    description: 'Sends contact message to support.',
  })
  @ApiOkResponse({
    description: 'Message sent successfully',
  })
  contactUs(@Body() contactDto: any) {
    return {
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.',
    };
  }
}
