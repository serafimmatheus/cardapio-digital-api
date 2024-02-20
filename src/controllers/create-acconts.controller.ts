import {
  Body,
  ConflictException,
  Controller,
  HttpCode,
  Post,
} from '@nestjs/common';
import { hash } from 'bcryptjs';
import { ZodValidationPipe } from 'src/pipe/zodValidation.pipe';
import { PrismaService } from 'src/prisma/prismaService';
import { z } from 'zod';

const schemaBody = z.object({
  name: z.string(),
  email: z.string().email(),
  password: z.string().min(6),
});

type BodySchema = z.infer<typeof schemaBody>;

@Controller('/api/accounts')
export class CreateAccountsController {
  constructor(private prisma: PrismaService) {}

  @Post()
  @HttpCode(201)
  async handle(@Body(new ZodValidationPipe(schemaBody)) body: BodySchema) {
    const { name, email, password } = body;

    const emailAlreadyExists = await this.prisma.user.findUnique({
      where: { email },
    });

    if (emailAlreadyExists) {
      throw new ConflictException('Email already exists');
    }

    const passwordHashed = await hash(password, 10);

    const newUser = {
      name,
      email,
      password: passwordHashed,
    };

    const user = await this.prisma.user.create({
      data: newUser,
    });

    return {
      ...user,
      password: undefined,
    };
  }
}
