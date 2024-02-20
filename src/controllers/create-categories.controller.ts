import {
  Body,
  ConflictException,
  Controller,
  Post,
  UseGuards,
} from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current.user';
import { TokenSchema } from 'src/auth/jwt.strategy';
import { ZodValidationPipe } from 'src/pipe/zodValidation.pipe';
import { PrismaService } from 'src/prisma/prismaService';
import { z } from 'zod';

const schemaBody = z.object({
  name: z.string(),
  slug: z.string(),
});

type BodySchema = z.infer<typeof schemaBody>;

@Controller('/api/category')
@UseGuards(AuthGuard('jwt'))
export class CreateCategoriesController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(schemaBody)) body: BodySchema,
    @CurrentUser() user: TokenSchema,
  ) {
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

    if (currentUser.role !== 'ADMIN') {
      throw new ConflictException('User is not admin');
    }

    const { name, slug } = body;

    const categoryAlreadyExists = await this.prisma.category.findFirst({
      where: {
        name,
      },
    });

    if (categoryAlreadyExists) {
      throw new ConflictException('Category already exists');
    }

    const currentSlug = slug.toLowerCase().replace(' ', '-');

    const newCategory = {
      name,
      slug: currentSlug,
    };

    const category = await this.prisma.category.create({
      data: newCategory,
    });

    return category;
  }
}
