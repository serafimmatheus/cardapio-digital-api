import {
  Controller,
  Delete,
  NotFoundException,
  Param,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current.user';
import { TokenSchema } from 'src/auth/jwt.strategy';
import { PrismaService } from 'src/prisma/prismaService';

@Controller('/api/categories')
@UseGuards(AuthGuard('jwt'))
export class DeleteCategoryController {
  constructor(private prisma: PrismaService) {}

  @Delete('/:id')
  async handle(@Param('id') id: string, @CurrentUser() user: TokenSchema) {
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

    const categoryAlreadyExists = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!categoryAlreadyExists) {
      throw new NotFoundException('Category not found');
    }

    await this.prisma.category.delete({
      where: {
        id: categoryAlreadyExists.id,
      },
    });

    return {
      message: 'Category deleted with success',
    };
  }
}
