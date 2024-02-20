import {
  Body,
  Controller,
  Post,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current.user';
import { TokenSchema } from 'src/auth/jwt.strategy';
import { ZodValidationPipe } from 'src/pipe/zodValidation.pipe';
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
  category_id: z.array(z.string()),
});

type BodySchema = z.infer<typeof schemaBody>;

@Controller('/api/product')
@UseGuards(AuthGuard('jwt'))
export class CreateProductsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(schemaBody)) body: BodySchema,
    @CurrentUser() user: TokenSchema,
  ) {
    const currentUser = await this.prisma.user.findUnique({
      where: { id: user.sub },
    });

    if (currentUser.role !== 'ADMIN') {
      throw new UnauthorizedException('User not found');
    }

    const {
      cover_image,
      title,
      slug,
      description,
      ingredients,
      discount_percentage,
      unity_price,
      category_id,
    } = body;

    const newProduct = await this.prisma.product.create({
      data: {
        cover_image,
        title,
        slug,
        description,
        ingredients,
        discount_percentage,
        unity_price,
        categories: {
          create: category_id.map((id) => ({
            category: {
              connect: {
                id,
              },
            },
          })),
        },
      },
    });

    return newProduct;
  }
}
