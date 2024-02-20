import {
  Body,
  Controller,
  ForbiddenException,
  Post,
  Req,
  Res,
  UsePipes,
} from '@nestjs/common';

import { compare } from 'bcryptjs';

import { UnauthorizedException } from '@nestjs/common';
import { z } from 'zod';
import { JwtService } from '@nestjs/jwt';

import { PrismaService } from 'src/prisma/prismaService';
import { ZodValidationPipe } from 'src/pipe/zodValidation.pipe';
import { EmailService } from 'src/email/email.service';

const schemaBody = z.object({
  email: z.string().email(),
  password: z.string().min(6),
});

type BodySchema = z.infer<typeof schemaBody>;

@Controller('/api/session')
export class AuthenticateController {
  constructor(
    private jwt: JwtService,
    private prisma: PrismaService,
    private emailService: EmailService,
  ) {}

  @Post('')
  @UsePipes(new ZodValidationPipe(schemaBody))
  async handle(
    @Body() body: BodySchema,
    @Req() req,
    @Res({ passthrough: true }) res,
  ) {
    const { email, password } = body;

    const user = await this.prisma.user.findUnique({
      where: { email },
    });

    if (!user) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const passwordMatch = await compare(password, user.password);

    if (!passwordMatch) {
      throw new UnauthorizedException('Invalid credentials');
    }

    const accessToken = this.jwt.sign(
      { sub: user.id },
      { algorithm: 'RS256', expiresIn: '1d' },
    );

    if (!accessToken) {
      throw new ForbiddenException('Access token not found');
    }

    res.cookie('access_token', accessToken, {
      httpOnly: true,
      secure: process.env.NODE_ENV === 'production',
      sameSite: 'strict',
      maxAge: 60 * 60 * 24 * 1000,
      path: '/',
    });

    this.emailService.enviarEmail(
      user.email,
      `http://localhost:5173/dashboard?token=${accessToken}`,
    );

    return {
      access_token: accessToken,
    };
  }
}
