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

@Controller('/api/category')
@UseGuards(AuthGuard('jwt'))
export class GetCategoriesController {
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
      throw new UnauthorizedException('User is not admin');
    }

    const categories = await this.prisma.category.findMany();

    return categories;
  }
}
