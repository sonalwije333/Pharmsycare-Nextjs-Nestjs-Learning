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
      // Robust extractor for Swagger/manual auth input.
      jwtFromRequest: (req: any) => {
        const headerValue = req?.headers?.authorization;
        if (!headerValue || typeof headerValue !== 'string') return null;

        let token = headerValue.trim();

        // Remove repeated "Bearer " prefixes (Swagger users often paste the full value).
        token = token.replace(/^(?:Bearer\s+)+/i, '').trim();

        // Remove accidental surrounding quotes.
        token = token.replace(/^"|"$/g, '').replace(/^'|'$/g, '').trim();

        // Support accidentally pasted JSON auth response.
        if (token.startsWith('{') && token.endsWith('}')) {
          try {
            const parsed = JSON.parse(token);
            token = parsed?.token || parsed?.accessToken || '';
          } catch {
            return null;
          }
        }

        return token || null;
      },
      ignoreExpiration: false,
      secretOrKey: jwtConfig.secret,
    });
  }

  async validate(payload: any) {
    let user = null;

    const userId = Number(payload?.sub);
    if (Number.isFinite(userId)) {
      try {
        user = await this.usersService.findOne(userId);
      } catch {
        user = null;
      }
    }

    if (!user && payload?.email) {
      user = await this.usersService.findByEmail(payload.email);
    }

    if (!user) {
      throw new UnauthorizedException();
    }

    return user;
  }
}