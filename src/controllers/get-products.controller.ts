import { Controller, Get, Query, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { PrismaService } from 'src/prisma/prismaService';
import { z } from 'zod';

const schemaQuery = z.object({
  page: z.coerce.string().optional().default('1').transform(Number),
  perPage: z.coerce.string().optional().default('10').transform(Number),
});

type QuerySchema = z.infer<typeof schemaQuery>;

@Controller('/api/products')
@UseGuards(AuthGuard('jwt'))
export class GetProductsController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(@Query() queries: QuerySchema) {
    const { page, perPage } = queries;

    const products = await this.prisma.product.findMany({
      skip: (Number(page ? page : 1) - 1) * Number(perPage ? perPage : 10),
      take: Number(perPage ? perPage : 10),
      orderBy: {
        createdAt: 'asc',
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
      perPage: perPage ? perPage : '10',
      page: page ? page : '1',
      products,
    };
  }
}
