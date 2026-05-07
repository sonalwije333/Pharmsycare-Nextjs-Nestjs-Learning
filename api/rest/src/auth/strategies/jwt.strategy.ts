// auth/strategies/jwt.strategy.ts
import { Injectable, UnauthorizedException } from '@nestjs/common';
import { PassportStrategy } from '@nestjs/passport';
import { ExtractJwt, Strategy } from 'passport-jwt';
import { jwtConfig } from 'src/config/jwt.config';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class JwtStrategy extends PassportStrategy(Strategy, 'jwt') {
  constructor(private usersService: UsersService) {
    super({
      // Robust extractor: handles headers like "Bearer <token>" and
      // accidental duplicates like "Bearer Bearer <token>" that some
      // Swagger clients produce when the user pastes the full "Bearer <token>".
      jwtFromRequest: (req: any) => {
        const header = req?.headers?.authorization;
        if (!header) return null;
        // Remove all occurrences of the literal "Bearer" (case-insensitive)
        // then trim to obtain the raw token value.
        return header.replace(/Bearer\s+/gi, '').trim();
      },
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: any) {
    const user = await this.usersService.findOne(payload.sub);
    if (!user) {
      throw new UnauthorizedException();
    }
    return user;
  }
}