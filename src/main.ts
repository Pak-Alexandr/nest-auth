import { NestFactory } from '@nestjs/core';
import { AppModule } from './app.module';
import * as process from 'process';

async function bootstrap() {
  const PORT = process.env.PORT;
  const app = await NestFactory.create(AppModule);
  await app.listen(PORT, () =>
    console.log(
      `Server start on port = ${PORT} with env = ${process.env.NODE_ENV}`,
    ),
  );
}
bootstrap();
