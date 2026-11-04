import { isForeignKeyViolation } from '../../database/foreign-key-violation';
import { isUniqueViolation } from '../../database/unique-violation';
import { ConflictException, Injectable, NotFoundException } from '@nestjs/common';
import { asc, eq } from 'drizzle-orm';
import { DatabaseService } from '../../database/database.service'; // Ajuste o caminho conforme seu projeto
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { courses } from './courses.schema';

@Injectable()
export class CoursesService {
  constructor(private readonly service: DatabaseService) {}

  async create(createCourseDto: CreateCourseDto) {
    try {
      const [course] = await this.service.db
        .insert(courses)
        .values({
          name: createCourseDto.name,
        })
        .returning();

      return course;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Já existe um curso com este nome.');
      }
      throw error;
    }
  }

  findAll() {
    return this.service.db
      .select()
      .from(courses)
      .orderBy(asc(courses.id));
  }

  async findOne(id: number) {
    const [course] = await this.service.db
      .select()
      .from(courses)
      .where(eq(courses.id, id))
      .limit(1);

    if (!course) {
      throw new NotFoundException(`Curso com ID ${id} não encontrado.`);
    }

    return course;
  }

  async update(id: number, updateCourseDto: UpdateCourseDto) {
    try {
      const existingCourse = await this.findOne(id);

      const [course] = await this.service.db
        .update(courses)
        .set({
          name: updateCourseDto.name ?? existingCourse.name,
        })
        .where(eq(courses.id, id))
        .returning();

      return course;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Já existe um curso com este nome.');
      }
      throw error;
    }
  }

  async remove(id: number) {
    try {
      const deletedCourses = await this.service.db
        .delete(courses)
        .where(eq(courses.id, id))
        .returning({ id: courses.id });

      if (!deletedCourses.length) {
        throw new NotFoundException(`Curso com ID ${id} não encontrado.`);
      }

      return {
        message: 'Curso removido com sucesso.',
      };
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('O curso possui matrículas e não pode ser excluído.');
      }
      throw error;
    }
  }
}
