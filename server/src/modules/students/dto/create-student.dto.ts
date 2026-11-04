import { IsInt, IsNotEmpty, IsPositive, IsString, MaxLength, MinLength } from 'class-validator';

export class CreateStudentDto {
  @IsNotEmpty({ message: 'O RA é obrigatório.' })
  @IsInt({ message: 'O RA deve ser um número inteiro.' })
  @IsPositive({ message: 'O RA deve ser um número positivo.' })
  ra!: number;

  @IsNotEmpty({ message: 'O nome é obrigatório.' })
  @IsString({ message: 'O nome deve ser uma string.' })
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres.' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres.' })
  name!: string;
}
