// auth/auth.controller.ts
import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  UseGuards, 
  Request,
  HttpCode,
  HttpStatus 
} from '@nestjs/common';
import { 
  ApiTags, 
  ApiOperation, 
  ApiResponse, 
  ApiBearerAuth, 
  ApiBody,
  ApiUnauthorizedResponse,
  ApiConflictResponse,
  ApiBadRequestResponse,
  ApiOkResponse,
  ApiCreatedResponse,
  ApiNotFoundResponse,
  ApiForbiddenResponse
} from '@nestjs/swagger';
import { AuthService } from './auth.service';
import { 
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
  RefreshTokenDto,
  AuthResponse,
  OtpResponse
} from './dto/create-auth.dto';
import { JwtAuthGuard } from './guards/jwt-auth.guard';
import { RefreshTokenGuard } from './guards/refresh-token.guard';
import { User } from 'src/users/entities/user.entity';
import { CoreMutationOutput } from 'src/common/dto/core-mutation-output.dto';
import { UsersService } from 'src/users/users.service';
import { AddWalletPointsDto } from 'src/users/dto/add-wallet-points.dto';

@ApiTags('🔐 Authentication')
@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly usersService: UsersService,
  ) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user account',
    description: 'Creates a new user account with email, password, and role permission'
  })
  @ApiCreatedResponse({
    description: 'User successfully registered',
    type: AuthResponse
  })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiConflictResponse({ description: 'User already exists' })
  @ApiBody({ type: RegisterDto })
  createAccount(@Body() registerDto: RegisterDto): Promise<AuthResponse> {
    return this.authService.register(registerDto);
  }

  @Post('login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'User login',
    description: 'Authenticate user with email and password'
  })
  @ApiOkResponse({
    description: 'Login successful',
    type: AuthResponse
  })
  @ApiUnauthorizedResponse({ description: 'Invalid credentials or account deactivated' })
  @ApiBadRequestResponse({ description: 'Invalid input data' })
  @ApiBody({ type: LoginDto })
  login(@Body() loginDto: LoginDto): Promise<AuthResponse> {
    return this.authService.login(loginDto);
  }

  @Post('refresh')
  @UseGuards(RefreshTokenGuard)
  @ApiBearerAuth('refresh-token')
  @ApiOperation({ 
    summary: 'Refresh access token',
    description: 'Get a new access token using a valid refresh token'
  })
  @ApiOkResponse({
    description: 'Token refreshed successfully',
    type: AuthResponse
  })
  @ApiUnauthorizedResponse({ description: 'Invalid refresh token' })
  @ApiBody({ type: RefreshTokenDto })
  refreshToken(@Body() refreshTokenDto: RefreshTokenDto): Promise<AuthResponse> {
    return this.authService.refreshToken(refreshTokenDto);
  }

  @Post('social-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'Social media login',
    description: 'Authenticate user using social provider (Google, Facebook, Apple)'
  })
  @ApiOkResponse({
    description: 'Social login successful',
    type: AuthResponse
  })
  @ApiBadRequestResponse({ description: 'Invalid provider or token' })
  @ApiBody({ type: SocialLoginDto })
  socialLogin(@Body() socialLoginDto: SocialLoginDto): Promise<AuthResponse> {
    return this.authService.socialLogin(socialLoginDto);
  }

  @Post('send-otp')
  @ApiOperation({ 
    summary: 'Send OTP code',
    description: 'Send verification code to phone number'
  })
  @ApiOkResponse({
    description: 'OTP sent successfully',
    type: OtpResponse
  })
  @ApiBadRequestResponse({ description: 'Invalid phone number' })
  @ApiBody({ type: OtpDto })
  sendOtpCode(@Body() otpDto: OtpDto): Promise<OtpResponse> {
    return this.authService.sendOtpCode(otpDto);
  }

  @Post('verify-otp')
  @ApiOperation({ 
    summary: 'Verify OTP code',
    description: 'Verify the OTP code sent to phone number'
  })
  @ApiOkResponse({
    description: 'OTP verified successfully',
    type: CoreMutationOutput
  })
  @ApiBadRequestResponse({ description: 'Invalid OTP code or session' })
  @ApiBody({ type: VerifyOtpDto })
  verifyOtpCode(@Body() verifyOtpDto: VerifyOtpDto): Promise<CoreMutationOutput> {
    return this.authService.verifyOtpCode(verifyOtpDto);
  }

  @Post('otp-login')
  @HttpCode(HttpStatus.OK)
  @ApiOperation({ 
    summary: 'OTP login',
    description: 'Login or register user using OTP verification'
  })
  @ApiOkResponse({
    description: 'OTP login successful',
    type: AuthResponse
  })
  @ApiBadRequestResponse({ description: 'Invalid OTP data' })
  @ApiBody({ type: OtpLoginDto })
  otpLogin(@Body() otpLoginDto: OtpLoginDto): Promise<AuthResponse> {
    return this.authService.otpLogin(otpLoginDto);
  }

  @Post('forget-password')
  @ApiOperation({ 
    summary: 'Request password reset',
    description: 'Send password reset link to email'
  })
  @ApiOkResponse({
    description: 'Reset link sent if email exists',
    type: CoreMutationOutput
  })
  @ApiBadRequestResponse({ description: 'Invalid email' })
  @ApiBody({ type: ForgetPasswordDto })
  forgetPassword(@Body() forgetPasswordDto: ForgetPasswordDto): Promise<CoreMutationOutput> {
    return this.authService.forgetPassword(forgetPasswordDto);
  }

  @Post('verify-forget-password')
  @ApiOperation({ 
    summary: 'Verify password reset token',
    description: 'Verify if password reset token is valid'
  })
  @ApiOkResponse({
    description: 'Token verification result',
    type: CoreMutationOutput
  })
  @ApiBadRequestResponse({ description: 'Invalid token or email' })
  @ApiBody({ type: VerifyForgetPasswordDto })
  verifyForgetPasswordToken(
    @Body() verifyForgetPasswordDto: VerifyForgetPasswordDto
  ): Promise<CoreMutationOutput> {
    return this.authService.verifyForgetPasswordToken(verifyForgetPasswordDto);
  }

  @Post('reset-password')
  @ApiOperation({ 
    summary: 'Reset password',
    description: 'Set new password using valid reset token'
  })
  @ApiOkResponse({
    description: 'Password reset successful',
    type: CoreMutationOutput
  })
  @ApiBadRequestResponse({ description: 'Invalid token or password requirements' })
  @ApiBody({ type: ResetPasswordDto })
  resetPassword(@Body() resetPasswordDto: ResetPasswordDto): Promise<CoreMutationOutput> {
    return this.authService.resetPassword(resetPasswordDto);
  }

  @Post('change-password')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Change password',
    description: 'Change user password (requires authentication)'
  })
  @ApiOkResponse({
    description: 'Password changed successfully',
    type: CoreMutationOutput
  })
  @ApiUnauthorizedResponse({ description: 'Invalid current password or not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  @ApiBody({ type: ChangePasswordDto })
  changePassword(
    @Request() req,
    @Body() changePasswordDto: ChangePasswordDto
  ): Promise<CoreMutationOutput> {
    return this.authService.changePassword(req.user.id, changePasswordDto);
  }

  @Post('logout')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Invalidate refresh token and logout user'
  })
  @ApiOkResponse({
    description: 'Logout successful',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Logged out successfully' }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async logout(@Request() req): Promise<{ success: boolean; message: string }> {
    return this.authService.logout(req.user.id);
  }

  @Get('me')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Retrieve detailed information about the authenticated user'
  })
  @ApiOkResponse({
    description: 'User profile retrieved successfully',
    type: User
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  @ApiNotFoundResponse({ description: 'User not found' })
  me(@Request() req): Promise<User> {
    return this.authService.me(req.user.id);
  }

  @Post('add-points')
  @UseGuards(JwtAuthGuard)
  @ApiBearerAuth('JWT-auth')
  @ApiOperation({ 
    summary: 'Add wallet points',
    description: 'Add points to user wallet (requires authentication)'
  })
  @ApiOkResponse({
    description: 'Points added successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Points added successfully' },
        balance: { type: 'number', example: 500 },
        wallet: {
          type: 'object',
          properties: {
            total_points: { type: 'number', example: 500 },
            points_used: { type: 'number', example: 0 },
            available_points: { type: 'number', example: 500 }
          }
        }
      }
    }
  })
  @ApiUnauthorizedResponse({ description: 'Not authenticated' })
  async addWalletPoints(@Request() req, @Body() addPointsDto: AddWalletPointsDto) {
    const updatedUser = await this.usersService.updateWallet(
      addPointsDto.customer_id,
      addPointsDto.points,
    );

    return {
      success: true,
      message: 'Points added successfully',
      balance: updatedUser.wallet?.available_points ?? 0,
      wallet: updatedUser.wallet,
    };
  }

  @Post('contact-us')
  @ApiOperation({ 
    summary: 'Contact us form',
    description: 'Submit contact us form'
  })
  @ApiOkResponse({
    description: 'Message sent successfully',
    schema: {
      type: 'object',
      properties: {
        success: { type: 'boolean', example: true },
        message: { type: 'string', example: 'Thank you for contacting us. We will get back to you soon.' },
        ticket_id: { type: 'string', example: 'TKT-123456' }
      }
    }
  })
  @ApiBody({
    schema: {
      type: 'object',
      properties: {
        name: { type: 'string', example: 'John Doe' },
        email: { type: 'string', example: 'john@example.com' },
        subject: { type: 'string', example: 'Product Inquiry' },
        message: { type: 'string', example: 'I have a question about...' }
      },
      required: ['name', 'email', 'message']
    }
  })
  contactUs(@Body() contactDto: any) {
    return {
      success: true,
      message: 'Thank you for contacting us. We will get back to you soon.',
      ticket_id: 'TKT-' + Date.now()
    };
  }
}