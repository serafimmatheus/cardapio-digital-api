import { Module } from '@nestjs/common';
import { PrismaService } from './prisma/prismaService';
import { ConfigModule } from '@nestjs/config';
import { envSchema } from './env';
import { AuthModule } from './auth/auth.module';
import { AuthenticateController } from './controllers/authenticate.controller';
import { CreateAccountsController } from './controllers/create-acconts.controller';
import { MeController } from './controllers/me.controller';
import { CreateCategoriesController } from './controllers/create-categories.controller';
import { GetCategoriesController } from './controllers/get-categories.controller';
import { CreateProductsController } from './controllers/create-products.controller';
import { GetProductsController } from './controllers/get-products.controller';
import { CreateCompanyController } from './controllers/create-company.controller';
import { GetCompanyController } from './controllers/get-company.controller';
import { UpdateCompanyController } from './controllers/update-company.controller';
import { UpdateUserForAdminController } from './controllers/updateUserForAdmin.controller';
import { UpdatePasswordController } from './controllers/update-password.controller';
import { EmailService } from './email/email.service';
import { MailerModule } from '@nestjs-modules/mailer';
import { UpdateCategoryController } from './controllers/update-category.controller';
import { DeleteCategoryController } from './controllers/delete-category.controller';
import { UpdateProductsController } from './controllers/update-products.controller';
import { DeleteProductController } from './controllers/delete-product.controller';
import { GetAllUsersController } from './controllers/get-all-users.controller';

@Module({
  imports: [
    ConfigModule.forRoot({
      validate: (env) => envSchema.parse(env),
      isGlobal: true,
    }),
    MailerModule.forRoot({
      transport: {
        host: 'sandbox.smtp.mailtrap.io',
        secure: false,
        port: 587,
        auth: {
          user: process.env.EMAIL_USER,
          pass: process.env.EMAIL_PASSWORD,
        },
        ignoreTLS: true,
      },
    }),
    AuthModule,
  ],
  controllers: [
    AuthenticateController,
    GetAllUsersController,
    CreateAccountsController,
    MeController,
    CreateCategoriesController,
    GetCategoriesController,
    CreateProductsController,
    GetProductsController,
    CreateCompanyController,
    GetCompanyController,
    UpdateCompanyController,
    UpdateUserForAdminController,
    UpdatePasswordController,
    UpdateCategoryController,
    UpdateProductsController,
    DeleteCategoryController,
    DeleteProductController,
  ],
  providers: [PrismaService, EmailService],
})
export class AppModule {}
