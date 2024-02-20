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
import { ZodValidationPipe } from 'src/pipe/zodValidation.pipe';
import { PrismaService } from 'src/prisma/prismaService';
import { z } from 'zod';

const schemaBody = z.object({
  role: z.enum(['ADMIN', 'USER', 'SUPERADMIN']),
});

type BodySchemaRole = z.infer<typeof schemaBody>;

@Controller('/api/users/:id/update/admin')
@UseGuards(AuthGuard('jwt'))
export class UpdateUserForAdminController {
  constructor(private prisma: PrismaService) {}

  @Patch()
  async handle(
    @Param('id') id: string,
    @CurrentUser() user: TokenSchema,
    @Body(new ZodValidationPipe(schemaBody)) body: BodySchemaRole,
  ) {
    const { role } = body;

    const currentUser = await this.prisma.user.findUnique({
      where: {
        id: user.sub,
        role: 'SUPERADMIN',
      },
    });

    if (!currentUser) {
      throw new UnauthorizedException('Unauthorized');
    }

    const userToUpdate = await this.prisma.user.findUnique({
      where: {
        id,
      },
    });

    if (!userToUpdate) {
      throw new NotFoundException('User not found');
    }

    if (userToUpdate.id === currentUser.id) {
      throw new UnauthorizedException('Unauthorized');
    }

    await this.prisma.user.update({
      where: {
        id,
      },
      data: {
        role,
      },
    });

    return {
      message: 'User updated',
    };
  }
}
