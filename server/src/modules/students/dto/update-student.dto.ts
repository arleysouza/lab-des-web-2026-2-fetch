import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateStudentDto {
  @IsOptional()
  @IsString({ message: 'O nome deve ser um texto válido.' })
  @MinLength(3, { message: 'O nome deve ter pelo menos 3 caracteres.' })
  @MaxLength(100, { message: 'O nome deve ter no máximo 100 caracteres.' })
  name?: string;
}
