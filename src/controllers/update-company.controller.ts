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
import { ZodValidationPipe } from 'src/pipe/zodValidation.pipe';
import { PrismaService } from 'src/prisma/prismaService';
import { z } from 'zod';

const schemaBody = z.object({
  name: z.string(),
  description: z.string().optional(),
  logo_url: z.string().url(),
  phone: z.string().optional(),
  email: z.string().email(),
  address: z.string().optional(),
  city: z.string().optional(),
  state: z.string().min(2).max(2).optional(),
  zipCode: z.string().optional(),
  country: z.string().optional(),
  facebook: z.string().url().optional(),
  instagram: z.string().url().optional(),
  linkedin: z.string().url().optional(),
  twitter: z.string().url().optional(),
  cnpj: z.string().optional(),
  whatsapp_message: z.string().optional(),
});

type CreateCompanyBody = z.infer<typeof schemaBody>;

@Controller('/api/company')
@UseGuards(AuthGuard('jwt'))
export class UpdateCompanyController {
  constructor(private prisma: PrismaService) {}

  @Put(':id')
  async handle(
    @Param('id') id: string,
    @Body(new ZodValidationPipe(schemaBody)) body: CreateCompanyBody,
    @CurrentUser() user: any,
  ) {
    const isUserAdmin = await this.prisma.user.findFirst({
      where: {
        id: user.id,
        role: 'ADMIN',
      },
    });

    if (!isUserAdmin) {
      throw new UnauthorizedException('User is not admin');
    }

    const company = await this.prisma.company.findFirst({
      where: {
        id,
      },
    });

    if (!company) {
      throw new NotFoundException('Company not found');
    }

    const {
      name,
      description,
      logo_url,
      phone,
      email,
      address,
      city,
      state,
      zipCode,
      country,
      facebook,
      instagram,
      linkedin,
      twitter,
      cnpj,
      whatsapp_message,
    } = body;

    await this.prisma.company.update({
      where: {
        id,
      },
      data: {
        name,
        description,
        logo_url,
        phone,
        email,
        address,
        city,
        state,
        zipCode,
        country,
        facebook,
        instagram,
        linkedin,
        twitter,
        cnpj,
        whatsapp_message,
      },
    });

    return {
      message: 'Company updated with success',
    };
  }
}
