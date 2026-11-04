import {
  Body,
  Controller,
  Delete,
  Get,
  Param,
  ParseIntPipe,
  Post,
  Patch,
} from "@nestjs/common";
import { CreateStudentDto } from "./dto/create-student.dto";
import { UpdateStudentDto } from "./dto/update-student.dto";
import { StudentsService } from "./students.service";

@Controller("api/students")
export class StudentsController {
  constructor(private readonly service: StudentsService) {}

  @Post()
  create(@Body() createStudentDto: CreateStudentDto) {
    return this.service.create(createStudentDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get(":ra")
  findOne(@Param("ra", ParseIntPipe) ra: number) {
    return this.service.findOne(ra);
  }

  @Patch(":ra")
  update(
    @Param("ra", ParseIntPipe) ra: number,
    @Body() updateStudentDto: UpdateStudentDto,
  ) {
    return this.service.update(ra, updateStudentDto);
  }

  @Delete(":ra")
  remove(@Param("ra", ParseIntPipe) ra: number) {
    return this.service.remove(ra);
  }
}
