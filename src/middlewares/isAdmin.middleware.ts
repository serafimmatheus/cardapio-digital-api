import { Injectable, UseGuards } from '@nestjs/common';
import { AuthGuard } from '@nestjs/passport';
import { Request, Response, NextFunction } from 'express';
import { CurrentUser } from 'src/auth/current.user';
import { TokenSchema } from 'src/auth/jwt.strategy';
import { PrismaService } from 'src/prisma/prismaService';

@Injectable()
@UseGuards(AuthGuard('jwt'))
export class IsAdminMiddleware {
  constructor(private prisma: PrismaService) {}
  async use(
    req: Request,
    res: Response,
    next: NextFunction,
    @CurrentUser() user: TokenSchema,
  ) {
    const isUserAdmin = await this.prisma.user.findFirst({
      where: {
        id: user.sub,
        role: 'ADMIN',
      },
    });

    if (!isUserAdmin) {
      return res.status(401).json({ message: 'User is not admin' });
    }

    next();
  }
}
