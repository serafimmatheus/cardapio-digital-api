import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { NestExpressApplication } from '@nestjs/platform-express';
import { Env } from './env';
import { join } from 'path';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.setBaseViewsDir(join(__dirname, '..', 'views'));
  app.setViewEngine('hbs');

  app.enableCors({
    origin: true,
    credentials: true,
    allowedHeaders: 'Content-Type, Accept, Authorization',
    methods: 'GET,HEAD,PUT,PATCH,POST,DELETE',
  });

  const configServer: ConfigService<Env, true> = app.get(ConfigService);
  const port = configServer.get('PORT', { infer: true });

  await app.listen(port);
}
bootstrap();
