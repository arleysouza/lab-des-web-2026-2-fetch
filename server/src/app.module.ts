import { Module } from '@nestjs/common';
import { ConfigModule } from '@nestjs/config';
import { resolve } from 'node:path';
import { DatabaseModule } from './database/database.module';
import { StudentsModule } from './modules/students/students.module';
import { CoursesModule } from './modules/courses/courses.module';
import { EnrollmentsModule } from './modules/enrollments/enrollments.module';
import { HealthController } from './health.controller';

@Module({
  controllers: [HealthController],
  imports: [
    // Tanto src quanto dist ficam dois níveis abaixo do .env da raiz.
    ConfigModule.forRoot({
      envFilePath: resolve(__dirname, '../../.env'),
      isGlobal: true, // Evita importar ConfigModule novamente em cada módulo.
      load: [() => ({
        database: {
          // Na execucao local, configure DB_HOST e DB_PORT para o banco publicado.
          host: process.env.DB_HOST,
          port: Number(process.env.DB_PORT),
          user: process.env.DB_USER,
          password: process.env.DB_PASSWORD,
          database: process.env.DB_NAME,
        },
      })],
    }),
    DatabaseModule,
    StudentsModule,
    CoursesModule,
    EnrollmentsModule
  ],
})
export class AppModule {}
