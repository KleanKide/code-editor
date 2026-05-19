import { Injectable, UnauthorizedException } from '@nestjs/common';
import { JwtService } from '@nestjs/jwt';
import { CreateGoogleUserData } from 'src/types/createGoogleUserData.types';
import { UsersService } from 'src/users/users.service';

@Injectable()
export class AuthService {
  constructor(
    private readonly jwtService: JwtService,
    private readonly usersService: UsersService,
  ) {}
  validateGoogleUser(googleUser: CreateGoogleUserData) {
    if (!googleUser.email) {
      throw new UnauthorizedException('user not found');
    }
    return this.usersService.findOrCreateGoogleUser({
      googleId: googleUser.googleId,
      email: googleUser.email,
      avatar: googleUser.avatar,
      name: googleUser.name,
    });
  }
  signToken(user: { id: string; email: string }) {
    return this.jwtService.sign({
      sub: user.id,
      email: user.email,
    });
  }
  async getMe(userId: string) {
    const user = await this.usersService.findById(userId);
    if (!user) {
      throw new UnauthorizedException('User not found');
    }
    return user;
  }
}
