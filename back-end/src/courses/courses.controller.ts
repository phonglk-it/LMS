import { Body, Controller, Get, Post, Patch, Param, Req, UseGuards, Delete } from '@nestjs/common';
import { CoursesService } from './courses.service';
import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/role.enum';
import { Request } from 'express';

interface RequestWithUser extends Request { user: { userId: number; role: Role }; }

@Controller('courses')
export class CoursesController {
  constructor(private coursesService: CoursesService) {}

  @Get('public')
  findPublished() {
    return this.coursesService.findPublished();
  }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Post() @Roles(Role.ADMIN)
  create(@Body() dto: any) { return this.coursesService.create(dto); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get() findAll(@Req() req: RequestWithUser) { return this.coursesService.findAll(req.user); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Get(':id') findOne(@Param('id') id: string, @Req() req: RequestWithUser) { return this.coursesService.findOne(+id, req.user); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id') @Roles(Role.ADMIN)
  update(@Param('id') id: string, @Body() dto: any, @Req() req: RequestWithUser) { return this.coursesService.update(+id, dto, req.user); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/publish') @Roles(Role.ADMIN, Role.INSTRUCTOR)
  publish(@Param('id') id: string, @Req() req: RequestWithUser) { return this.coursesService.publish(+id, req.user); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/unpublish') @Roles(Role.ADMIN, Role.INSTRUCTOR)
  unpublish(@Param('id') id: string, @Req() req: RequestWithUser) { return this.coursesService.unpublish(+id, req.user); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Patch(':id/change-instructor') @Roles(Role.ADMIN)
  changeInstructor(@Param('id') id: string, @Body('instructorId') instructorId: number) { return this.coursesService.changeInstructor(+id, instructorId); }

  @UseGuards(JwtAuthGuard, RolesGuard)
  @Delete(':id') @Roles(Role.ADMIN)
  remove(@Param('id') id: string, @Req() req: RequestWithUser) { return this.coursesService.remove(+id, req.user); }
}