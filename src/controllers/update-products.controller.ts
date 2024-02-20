import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Patch,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current.user';
import { TokenSchema } from 'src/auth/jwt.strategy';
import { PrismaService } from 'src/prisma/prismaService';
import { z } from 'zod';

const schemaBody = z.object({
  cover_image: z.array(z.string()),
  title: z.string(),
  slug: z.string(),
  description: z.string(),
  ingredients: z.array(z.string()),
  discount_percentage: z.number(),
  unity_price: z.number(),
  categories_id: z.array(z.string()).optional(),
});

type BodySchema = z.infer<typeof schemaBody>;

@Controller('/api/products')
@UseGuards(AuthGuard('jwt'))
export class UpdateProductsController {
  constructor(private prisma: PrismaService) {}

  @Patch('/:id')
  async handle(
    @CurrentUser() user: TokenSchema,
    @Body() body: BodySchema,
    @Param('id') id: string,
  ) {
    const {
      cover_image,
      title,
      slug,
      description,
      ingredients,
      discount_percentage,
      unity_price,
      categories_id,
    } = body;

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

    const product = await this.prisma.product.findUnique({
      where: {
        id,
      },
      include: {
        categories: {
          select: {
            category: true,
          },
        },
      },
    });

    if (!product) {
      throw new NotFoundException('Product not found');
    }

    const updateProduct = await this.prisma.product.update({
      where: {
        id,
      },
      data: {
        cover_image: cover_image,
        title,
        slug,
        description,
        ingredients,
        discount_percentage,
        unity_price,
        categories: {
          connect: categories_id?.map((id) => ({
            id,
          })),
        },
      },

      include: {
        categories: {
          select: {
            category: true,
          },
        },
      },
    });

    return {
      message: 'Product updated with success',
      updateProduct,
    };
  }
}
