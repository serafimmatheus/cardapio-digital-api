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

@Controller('/api/create-company')
@UseGuards(AuthGuard('jwt'))
export class CreateCompanyController {
  constructor(private prisma: PrismaService) {}

  @Post()
  async handle(
    @Body(new ZodValidationPipe(schemaBody)) body: CreateCompanyBody,
    @CurrentUser() user: TokenSchema,
  ) {
    const isUserAdmin = await this.prisma.user.findFirst({
      where: {
        id: user.sub,
        role: 'ADMIN',
      },
    });

    if (!isUserAdmin) {
      throw new ConflictException('User is not an admin');
    }

    const isCompanyExists = await this.prisma.company.findMany();

    if (isCompanyExists.length > 0) {
      throw new ConflictException('Company already exists');
    }

    const {
      address,
      city,
      cnpj,
      country,
      description,
      email,
      facebook,
      instagram,
      linkedin,
      logo_url,
      name,
      phone,
      state,
      twitter,
      whatsapp_message,
      zipCode,
    } = body;

    const newCompany = await this.prisma.company.create({
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
      company: newCompany,
    };
  }
}
