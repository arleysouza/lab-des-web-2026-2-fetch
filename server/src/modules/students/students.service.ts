import { isForeignKeyViolation } from '../../database/foreign-key-violation';
import { isUniqueViolation } from '../../database/unique-violation';
import { ConflictException, Injectable, NotFoundException } from "@nestjs/common";
import { asc, eq } from "drizzle-orm";
import { DatabaseService } from "../../database/database.service";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { students } from "./students.schema";

@Injectable()
export class StudentsService {
  constructor(private readonly service: DatabaseService) {}

  async create(createStudentDto: CreateStudentDto) {
    try {
      const [student] = await this.service.db
        .insert(students)
        .values({
          ra: createStudentDto.ra,
          name: createStudentDto.name,
        })
        .returning();

      return student;
    } catch (error) {
      if (isUniqueViolation(error)) {
        throw new ConflictException('Já existe um estudante com este RA.');
      }
      throw error;
    }
  }

  findAll() {
    return this.service.db.select().from(students).orderBy(asc(students.name));
  }

  async findOne(ra: number) {
    const [student] = await this.service.db
      .select()
      .from(students)
      .where(eq(students.ra, ra))
      .limit(1);

    if (!student) {
      throw new NotFoundException(`Estudante com RA ${ra} não encontrado.`);
    }

    return student;
  }

  async update(ra: number, updateStudentDto: UpdateStudentDto) {
    const existingStudent = await this.findOne(ra);

    if (updateStudentDto.name) {
      const [student] = await this.service.db
        .update(students)
        .set({
          name: updateStudentDto.name,
        })
        .where(eq(students.ra, ra))
        .returning();

      return student;
    }
    return existingStudent;
  }

  async remove(ra: number) {
    try {
      const deletedStudents = await this.service.db
        .delete(students)
        .where(eq(students.ra, ra))
        .returning({ ra: students.ra });

      if (!deletedStudents.length) {
        throw new NotFoundException(`Estudante com RA ${ra} não encontrado.`);
      }

      return {
        message: "Estudante removido com sucesso.",
      };
    } catch (error) {
      if (isForeignKeyViolation(error)) {
        throw new ConflictException('O estudante possui matrículas e não pode ser excluído.');
      }
      throw error;
    }
  }
}
