import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  const configService = app.get(ConfigService);
  const port = configService.get<number>('SERVER_PORT');
  app.setGlobalPrefix('/');
  app.useGlobalPipes(
    new ValidationPipe({
      transform: true,
    })
  );

  const config = new DocumentBuilder()
    .setTitle('티켓 예매 및 중고 거래 서비스')
    .setVersion('1.0')
    .addTag('Ticketing')
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document);

  await app.listen(port);
}
bootstrap();
