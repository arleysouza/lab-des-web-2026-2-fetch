import { IsInt, IsNotEmpty, IsPositive } from 'class-validator';

export class CreateEnrollmentDto {
  @IsNotEmpty({ message: 'O RA do estudante é obrigatório.' })
  @IsInt({ message: 'O RA do estudante deve ser um número inteiro.' })
  @IsPositive({ message: 'O RA do estudante deve ser um número positivo.' })
  studentRa!: number;

  @IsNotEmpty({ message: 'O ID do curso é obrigatório.' })
  @IsInt({ message: 'O ID do curso deve ser um número inteiro.' })
  @IsPositive({ message: 'O ID do curso deve ser um número positivo.' })
  courseId!: number;
}
