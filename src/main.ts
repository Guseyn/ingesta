import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { runMigrations } from './runMigrations';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { CityCron } from './cron/CityCron';
import { PropertyCron } from './cron/PropertyCron';

async function bootstrap() {
  // RUN MONGODB MIGRATIONS
  runMigrations();

  // CREATE APP
  const app = await NestFactory.create(AppModule);

  // SET UP VALIDATIONS
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
      transformOptions: {
        enableImplicitConversion: true,
      },
    }),
  );

  // SWAGGER
  const config = new DocumentBuilder()
    .setTitle('Property API')
    .setDescription('API to search properties and cities')
    .setVersion('1.0')
    .build();

  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('api', app, document);

  // SERVER
  const port = process.env.PORT ?? 3000;
  await app.listen(port).then(async () => {
    console.log(`App started at http://localhost:${port}`);
    console.log(`Swagger UI available at http://localhost:${port}/api`);

    // RUN CRON JOBS AFTER SERVER IS READY
    const propertyCron = app.get(PropertyCron);
    const cityCron = app.get(CityCron);
    await Promise.all([
      propertyCron.runImmediately(),
      // cityCron.runImmediately(),
    ]);
  });
}
bootstrap();
