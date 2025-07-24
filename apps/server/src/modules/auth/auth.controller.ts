import { Controller, Post, Body, UseGuards, Get, Req } from '@nestjs/common';
import { AuthService } from './auth.service';
import { AuthResponse, LoginDto, RegisterDto } from './dto/create-auth.dto';
import { ApiBearerAuth, ApiOkResponse, ApiOperation } from '@nestjs/swagger';
import { JwtAuthGuard } from './guards/jwt-auth.guard';

@ApiBearerAuth('access-token') 
@Controller()
export class AuthController {
  constructor(private readonly authService: AuthService) {}

  @Post('register')
  @ApiOperation({ summary: 'Register a new user' })
  @ApiOkResponse({
    description: '',
    type: AuthResponse,
  })
  createAccount(@Body() registerDto: RegisterDto) {
    return this.authService.register(registerDto);
  }

  @Post('token')
  @ApiOperation({ summary: 'Login to system' })
  @ApiOkResponse({
    description: '',
    type: AuthResponse,
  })
  login(@Body() loginDto: LoginDto) {
    return this.authService.login(loginDto);
  }

  @UseGuards(JwtAuthGuard)
  @Get('me')
  async me(@Req() req) {
    // `req.user` is populated by JwtStrategy's validate() method
    return this.authService.me(req.user.id);
  }

  @Post('logout')
  async logout(): Promise<boolean> {
    return true;
  }
}
