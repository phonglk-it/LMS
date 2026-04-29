import { Controller, Post, UseGuards, Request, Get, Body, Param, Delete } from '@nestjs/common';
import { EnrollmentsService } from './enrollments.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/role.enum';

@Controller('enrollments')
@UseGuards(JwtAuthGuard, RolesGuard)
export class EnrollmentsController {
  constructor(private enrollmentsService: EnrollmentsService) {}

  @Post()
  @Roles(Role.STUDENT)
  enroll(@Body('courseId') courseId: number, @Request() req: any) {
    return this.enrollmentsService.enroll(courseId, req.user.userId);
  }

  @Get('me')
  @Roles(Role.STUDENT)
  myCourses(@Request() req: any) {
    return this.enrollmentsService.findMyCourses(req.user.userId);
  }

  @Get('course/:courseId')
  @Roles(Role.INSTRUCTOR, Role.ADMIN)
  students(@Param('courseId') courseId: number, @Request() req: any) {
    return this.enrollmentsService.findStudentsOfCourse(+courseId, req.user);
  }

  @Delete(':courseId')
  @Roles(Role.STUDENT)
  unenroll(@Param('courseId') courseId: number, @Request() req: any) {
    return this.enrollmentsService.unenroll(+courseId, req.user.userId);
}
}