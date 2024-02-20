import {
  Body,
  Controller,
  NotFoundException,
  Param,
  Put,
  UnauthorizedException,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current.user';
import { TokenSchema } from 'src/auth/jwt.strategy';
import { ZodValidationPipe } from 'src/pipe/zodValidation.pipe';
import { PrismaService } from 'src/prisma/prismaService';
import { z } from 'zod';

const schemaBodyUpdateCategory = z.object({
  name: z.string(),
  slug: z.string(),
});

type BodySchemaUpdateCategory = z.infer<typeof schemaBodyUpdateCategory>;

@Controller('/api/categories')
@UseGuards(AuthGuard('jwt'))
export class UpdateCategoryController {
  constructor(private prisma: PrismaService) {}

  @Put('/:id')
  async handle(
    @Param('id') id: string,
    @CurrentUser() user: TokenSchema,
    @Body(new ZodValidationPipe(schemaBodyUpdateCategory))
    body: BodySchemaUpdateCategory,
  ) {
    const { name, slug } = body;

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

    const category = await this.prisma.category.findUnique({
      where: {
        id,
      },
    });

    if (!category) {
      throw new NotFoundException('Category not found');
    }

    await this.prisma.category.update({
      where: {
        id,
      },
      data: {
        name,
        slug,
      },
    });

    return { message: 'Category updated' };
  }
}
