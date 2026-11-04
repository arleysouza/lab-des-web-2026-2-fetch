import { 
  Controller, 
  Get, 
  Post, 
  Body, 
  Patch, 
  Param, 
  Delete, 
  ParseIntPipe 
} from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { CreateEnrollmentDto } from './dto/create-enrollment.dto';

@Controller('api/enrollments')
export class EnrollmentsController {
  constructor(private readonly service: EnrollmentsService) {}

  @Post()
  create(@Body() createEnrollmentDto: CreateEnrollmentDto) {
    return this.service.create(createEnrollmentDto);
  }

  @Get()
  findAll() {
    return this.service.findAll();
  }

  @Get('student/:studentRa/course/:courseId')
  findOne(
    @Param('studentRa', ParseIntPipe) studentRa: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.service.findOne(studentRa, courseId);
  }

  @Delete('student/:studentRa/course/:courseId')
  remove(
    @Param('studentRa', ParseIntPipe) studentRa: number,
    @Param('courseId', ParseIntPipe) courseId: number,
  ) {
    return this.service.remove(studentRa, courseId);
  }
}
