import { Injectable, UnauthorizedException, ConflictException, Logger } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { ConfigService } from '@nestjs/config';
import { createClient } from '@supabase/supabase-js';
import { LoginDto } from './dto/login.dto';
import { RegisterDto } from './dto/register.dto';

@Injectable()
export class AuthService {
  private readonly logger = new Logger(AuthService.name);
  private supabase;

  constructor(
    private jwtService: JwtService,
    private configService: ConfigService,
  ) {
    // TODO: Provide SUPABASE_URL and SUPABASE_SERVICE_ROLE_KEY in .env
    this.supabase = createClient(
      this.configService.get('SUPABASE_URL'),
      this.configService.get('SUPABASE_SERVICE_ROLE_KEY'),
    );
  }

  async register(dto: RegisterDto) {
    const { data, error } = await this.supabase.auth.admin.createUser({
      email: dto.email,
      password: dto.password,
      user_metadata: { full_name: dto.fullName },
      email_confirm: true,
    });

    if (error) {
      if (error.message.includes('already')) {
        throw new ConflictException('User with this email already exists');
      }
      throw new UnauthorizedException(error.message);
    }

    const payload = { sub: data.user.id, email: data.user.email };
    const token = this.jwtService.sign(payload);

    return { user: data.user, accessToken: token };
  }

  async login(dto: LoginDto) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });

    if (error) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const payload = { sub: data.user.id, email: data.user.email };
    const token = this.jwtService.sign(payload);

    return { user: data.user, accessToken: token };
  }

  async validateToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data.user) {
      throw new UnauthorizedException('Invalid token');
    }
    return data.user;
  }

  async getProfile(userId: string) {
    const { data, error } = await this.supabase.auth.admin.getUserById(userId);
    if (error) {
      throw new UnauthorizedException('User not found');
    }
    return data.user;
  }
}
