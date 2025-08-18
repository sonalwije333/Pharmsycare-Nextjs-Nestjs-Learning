import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse, LoginDto, RegisterDto } from './dto/create-auth.dto';
import {
  ApiBearerAuth,
  ApiOkResponse,
  ApiOperation,
  ApiTags,
} from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiTags('Authentication')
@ApiBearerAuth('access-token')
@Controller('v1/auth')
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ 
    summary: 'Register a new user',
    description: 'Creates a new user account with the provided details.'
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
    description: 'Authenticates user and returns JWT token.'
  })
  @ApiOkResponse({
    description: 'User successfully logged in',
    type: AuthResponse,
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  @ApiOperation({ 
    summary: 'Get current user profile',
    description: 'Returns the profile of the currently authenticated user.'
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
  @ApiOperation({ 
    summary: 'Logout user',
    description: 'Invalidates the current user session.'
  })
  @ApiOkResponse({
    description: 'User successfully logged out',
    type: Boolean,
  })
  async logout(): Promise<boolean> {
    return true;
  }
}