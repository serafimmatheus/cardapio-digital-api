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

@Controller('/api/products')
@UseGuards(AuthGuard('jwt'))
export class DeleteProductController {
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
      throw new UnauthorizedException('User not found');
    }

    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    await this.prisma.product.delete({
      where: {
        id,
      },
    });

    return {
      message: 'Product deleted',
    };
  }
}
