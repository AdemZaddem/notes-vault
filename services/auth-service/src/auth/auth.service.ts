import {
  BadRequestException,
  Injectable,
  UnauthorizedException,
} from '@nestjs/common';
import { createSupabaseClient, prisma } from '@notes-vault/database';

@Injectable()
export class AuthService {
  private supabase = createSupabaseClient();

  async register(dto: {
    firstName: string;
    lastName: string;
    email: string;
    password: string;
  }) {
    const { data: authData, error } = await this.supabase.auth.signUp({
      email: dto.email,
      password: dto.password,
      options: {
        data: {
          firstName: dto.firstName,
          lastName: dto.lastName,
        },
      },
    });
    if (error) throw new BadRequestException(error.message);
    if (!authData.user) throw new BadRequestException('Something went wrong');

    await prisma.profile.create({
      data: {
        id: authData.user.id,
        email: dto.email,
        firstName: dto.firstName,
        lastName: dto.lastName,
      },
    });
    return { user: authData.user, session: authData.session };
  }

  async login(dto: { email: string; password: string }) {
    const { data, error } = await this.supabase.auth.signInWithPassword({
      email: dto.email,
      password: dto.password,
    });
    if (error) throw new UnauthorizedException(error.message);
    return { user: data.user, session: data.session };
  }

  async getOAuthUrl(provider: 'google' | 'github') {
    const { data, error } = await this.supabase.auth.signInWithOAuth({
      provider,
      options: {
        redirectTo: 'http://localhost:3000/auth/callback',
      },
    });
    if (error) throw new BadRequestException(error.message);
    return { url: data.url };
  }

  async verifyToken(token: string) {
    const { data, error } = await this.supabase.auth.getUser(token);
    if (error || !data.user) throw new UnauthorizedException('Invalid token');
    return data.user;
  }
}
