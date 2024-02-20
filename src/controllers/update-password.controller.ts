import { Body, Controller, Param, Patch, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current.user';
import { TokenSchema } from 'src/auth/jwt.strategy';
import { ZodValidationPipe } from 'src/pipe/zodValidation.pipe';
import { PrismaService } from 'src/prisma/prismaService';
import { z } from 'zod';

const schemaBodyPassword = z.object({
  password: z.string(),
});

type BodySchemaPassword = z.infer<typeof schemaBodyPassword>;

@Controller('/api/users/:id/update/missing-password')
@UseGuards(AuthGuard('jwt'))
export class UpdatePasswordController {
  constructor(private prisma: PrismaService) {}

  @Patch()
  async handle(
    @Body(new ZodValidationPipe(schemaBodyPassword)) body: BodySchemaPassword,
    @Param('id') id: string,
    @CurrentUser() user: TokenSchema,
  ) {
    return { message: 'ok', body, id, user };
  }
}
