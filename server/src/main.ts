import { ValidationPipe } from "@nestjs/common";
import { NestFactory } from "@nestjs/core";
import type { IncomingMessage, ServerResponse } from "node:http";
import { AppModule } from "./app.module";

async function bootstrap() {
  const app = await NestFactory.create(AppModule);

  // Ao receber SIGTERM do Docker, o NestJS acionará onModuleDestroy() para fechar o pool de conexões.
  app.enableShutdownHooks();

  // Impede o armazenamento de respostas, inclusive erros, por navegadores e proxies. Assim, cada nova consulta acessa a API.
  app.use((_request: IncomingMessage, response: ServerResponse, next: () => void) => {
    response.setHeader("Cache-Control", "no-store");
    next();
  });

  // Aplica validação automática em todas as entradas que usam DTOs.
  app.useGlobalPipes(
    new ValidationPipe({
      whitelist: true, // Mantém apenas propriedades declaradas no DTO.
      transform: true, // Converte valores para os tipos esperados pelo DTO.
      forbidNonWhitelisted: true, // Interrompe a requisição quando chegam campos extras.
    }),
  );

  // Lê a porta do ambiente e usa 3000 como fallback local.
  const port = Number(process.env.SERVER_PORT || 3000);
  await app.listen(port);
}

bootstrap();
