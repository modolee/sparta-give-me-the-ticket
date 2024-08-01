import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import { ConfigService } from '@nestjs/config';
import { ValidationPipe } from '@nestjs/common';
import { DocumentBuilder, SwaggerModule } from '@nestjs/swagger';
import { NestExpressApplication } from '@nestjs/platform-express';
import { resolve } from 'path';

async function bootstrap() {
  // NestExpressApplication는 Express 기능을 Nest.js에서 활용할 수 있게 해줌
  const app = await NestFactory.create<NestExpressApplication>(AppModule);

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
    .addBearerAuth({ type: 'http', scheme: 'bearer', bearerFormat: 'JWT' })
    .build();
  const document = SwaggerModule.createDocument(app, config);
  SwaggerModule.setup('/', app, document, {
    swaggerOptions: {
      persistAuthorization: true, // 새로고침 시에도 JWT 유지하기
      tagsSorter: 'alpha', // API 그룹 정렬을 알파벳 순으로
      operationsSorter: 'alpha', // API 그룹 내 정렬을 알파벳 순으로
    },
  });

  // ejs 설정
  app.useStaticAssets(resolve('./src/public')); // 정적 파일 경로 설정 (js, css, img)
  app.setBaseViewsDir(resolve('./src/views')); // 클라이언트에 보여질 파일들의 경로 설정
  app.setViewEngine('ejs'); // 클라이언트엑세 보여질 템플릿 엔진 설정

  await app.listen(port);
}
bootstrap();
