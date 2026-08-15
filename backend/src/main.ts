import { ValidationPipe } from '@nestjs/common';
import { NestFactory } from '@nestjs/core';
import type { NestExpressApplication } from '@nestjs/platform-express';
import { join } from 'path';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { AppModule } from './app.module';

async function bootstrap() {
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

  app.useStaticAssets(
    join(process.cwd(), 'uploads'),
    { prefix: '/uploads/' },
  );

  app.setGlobalPrefix('api');

  const origins = (
    process.env.CORS_ORIGINS ||
    'http://localhost:3000,http://127.0.0.1:3000,http://localhost:3001,http://127.0.0.1:3001'
  )
    .split(',')
    .map((value) => value.trim())
    .filter(Boolean);

  app.enableCors({
    origin: origins,
    credentials: true,
  });

  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true,
      transform: true,
      forbidNonWhitelisted: true,
    }),
  );

  const swaggerConfig = new DocumentBuilder()
    .setTitle('E-Commerce Platform API')
    .setDescription(
      'REST API for storefront, customer, admin, inventory and delivery operations.',
    )
    .setVersion('1.0')
    .addBearerAuth()
    .build();

  const document = SwaggerModule.createDocument(
    app,
    swaggerConfig,
  );

  SwaggerModule.setup(
    'api/docs',
    app,
    document,
  );

  const port = Number(
    process.env.PORT || 5000,
  );

  await app.listen(
    port,
    '0.0.0.0',
  );

  console.log(
    `E-Commerce Platform API running on http://localhost:${port}/api`,
  );

  console.log(
    `Swagger docs: http://localhost:${port}/api/docs`,
  );
}

bootstrap();