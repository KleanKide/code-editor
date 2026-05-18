import { Controller, Get, Post, Req, Res, UseGuards } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { AuthGuard } from '@nestjs/passport';
import express from 'express';

import { AuthService } from './auth.service';

@Controller('auth')
export class AuthController {
  constructor(
    private readonly authService: AuthService,
    private readonly configService: ConfigService,
  ) {}

  @Get('google')
  @UseGuards(AuthGuard('google'))
  googleAuth() {}

  @Get('google/callback')
  @UseGuards(AuthGuard('google'))
  async googleCallback(
    @Req() req: express.Request,
    @Res() res: express.Response,
  ) {
    const user = await this.authService.validateGoogleUser(req.user as any);
    const token = this.authService.signToken(user);
    res.cookie('access_token', token, {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'lax',
      maxAge: 7 * 24 * 60 * 60 * 1000,
    });
    return res.redirect(
      `${this.configService.getOrThrow<string>('FRONTEND_URL')}`,
    );
  }
  @Get('me')
  @UseGuards(AuthGuard('jwt'))
  me(@Req() req: express.Request) {
    return req.user;
  }

  @Post('logout')
  logout(@Res() res: express.Response) {
    res.clearCookie('access_token', {
      httpOnly: true,
      secure: this.configService.get<string>('NODE_ENV') === 'production',
      sameSite:
        this.configService.get<string>('NODE_ENV') === 'production'
          ? 'none'
          : 'lax',
    });

    return res.json({ success: true });
  }
}
