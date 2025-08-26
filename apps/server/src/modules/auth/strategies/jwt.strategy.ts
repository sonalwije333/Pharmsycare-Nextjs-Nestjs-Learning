import { ExtractJwt, Strategy } from 'passport-jwt';
import { PassportStrategy } from '@nestjs/passport';
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { UsersService } from '../../users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy) {
  constructor(
    private configService: ConfigService,
    private usersService: UsersService
  ) {
    super({
      jwtFromRequest: ExtractJwt.fromAuthHeaderAsBearerToken(),
      ignoreExpiration: false,
      secretOrKey: configService.get('JWT_SECRET') || 'your-secret-key',
    });
  }

  async validate(payload: any) {
    console.log('JWT Payload:', payload);

    try {
      const user = await this.usersService.findByEmail(payload.email);

      if (!user) {
        throw new UnauthorizedException('User not found');
      }

      if (!user.is_active) {
        throw new UnauthorizedException('User is inactive');
      }

      // Extract permission names from the user object
      const permissions = user.permissions?.map(p => p.name) || [];
      console.log('User permissions:', permissions);

      // Return user data that will be available in req.user
      return {
        id: user.id,
        email: user.email,
        name: user.name,
        permissions: permissions, // This is what RolesGuard is looking for
      };
    } catch (error) {
      console.error('JWT Validation Error:', error);
      throw new UnauthorizedException('Invalid token');
    }
  }
}