import { Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current.user';
import { TokenSchema } from 'src/auth/jwt.strategy';
import { PrismaService } from 'src/prisma/prismaService';

@Controller('/api/me')
@UseGuards(AuthGuard('jwt'))
export class MeController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(@CurrentUser() user: TokenSchema) {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
      },
    });

    return {
      ...currentUser,
      password: undefined,
    };
  }
}
