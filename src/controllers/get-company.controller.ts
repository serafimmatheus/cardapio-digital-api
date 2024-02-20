import { ConflictException, Controller, Get, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { CurrentUser } from 'src/auth/current.user';
import { TokenSchema } from 'src/auth/jwt.strategy';
import { PrismaService } from 'src/prisma/prismaService';

@Controller('/api/company')
@UseGuards(AuthGuard('jwt'))
export class GetCompanyController {
  constructor(private prisma: PrismaService) {}

  @Get()
  async handle(@CurrentUser() user: TokenSchema) {
    const isUserAdmin = await this.prisma.user.findFirst({
      where: {
        id: user.sub,
        role: 'ADMIN',
      },
    });

    if (!isUserAdmin) {
      throw new ConflictException('User is not an admin');
    }

    const company = await this.prisma.company.findMany();

    return company;
  }
}
