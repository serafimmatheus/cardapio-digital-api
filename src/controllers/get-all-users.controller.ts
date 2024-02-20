import {
  Controller,
  Get,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current.user';
import { TokenSchema } from 'src/auth/jwt.strategy';
import { PrismaService } from 'src/prisma/prismaService';

@Controller('/api/users/all')
@UseGuards(AuthGuard('jwt'))
export class GetAllUsersController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(@CurrentUser() user: TokenSchema) {
    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
        AND: {
          role: {
            in: ['ADMIN', 'SUPERADMIN'],
          },
        },
      },
    });

    if (!currentUser) {
      throw new UnauthorizedException(
        'You are not allowed to access this resource',
      );
    }
    const users = await this.prisma.user.findMany({
      select: {
        id: true,
        name: true,
        email: true,
        role: true,
      },
    });

    return { users };
  }
}
