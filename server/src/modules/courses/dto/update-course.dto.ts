import { IsOptional, IsString, MaxLength, MinLength } from 'class-validator';

export class UpdateCourseDto {
  @IsOptional()
  @IsString({ message: 'O nome do curso deve ser um texto válido.' })
  @MinLength(3, { message: 'O nome do curso deve ter pelo menos 3 caracteres.' })
  @MaxLength(100, { message: 'O nome do curso deve ter no máximo 100 caracteres.' })
  name?: string;
}
