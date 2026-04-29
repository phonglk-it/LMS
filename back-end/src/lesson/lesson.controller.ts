import {
  Controller,
  Post,
  Get,
  Put,
  Delete,
  Param,
  Body,
  ParseIntPipe,
  UseGuards,
  UseInterceptors,
  UploadedFile,
  Req,
  NotFoundException,
} from '@nestjs/common';
import { FileInterceptor } from '@nestjs/platform-express';
import { diskStorage } from 'multer';
import { extname } from 'path';

import { LessonService } from './lesson.service';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

import { JwtAuthGuard } from '../auth/guards/jwt-auth.guard';
import { RolesGuard } from '../auth/guards/roles.guard';
import { Roles } from '../auth/decorators/roles.decorator';
import { Role } from '../users/role.enum';

@Controller('lessons')
@UseGuards(JwtAuthGuard, RolesGuard)
export class LessonController {
  constructor(private readonly lessonService: LessonService) {}

  // ================= CREATE =================
  @Post()
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @UseInterceptors(
    FileInterceptor('pdf', {
      storage: diskStorage({
        destination: './uploads/pdfs',
        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
      fileFilter: (req, file, callback) => {
        if (!file.mimetype.includes('pdf')) {
          return callback(new Error('Only PDF allowed'), false);
        }
        callback(null, true);
      },
    }),
  )
  create(
    @Body() dto: CreateLessonDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    if (file) {
      dto.pdfUrl = `/uploads/pdfs/${file.filename}`;
    }
    return this.lessonService.create(dto);
  }

  // ================= GET BY COURSE (PAYWALL) =================
  @Get('course/:courseId')
  @Roles(Role.ADMIN, Role.INSTRUCTOR, Role.STUDENT)
  findByCourse(
    @Param('courseId', ParseIntPipe) courseId: number,
    @Req() req: any,
  ) {
    const user = req.user;

    // Admin / Instructor → full access
    if (user.role === Role.ADMIN || user.role === Role.INSTRUCTOR) {
      return this.lessonService.findByCourse(courseId);
    }

    // ✅ FIX QUAN TRỌNG: dùng user.userId
    return this.lessonService.findByCourseForStudent(
      courseId,
      user.userId,
    );
  }

  // ================= UPDATE =================
  @Put(':id')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  @UseInterceptors(
    FileInterceptor('pdf', {
      storage: diskStorage({
        destination: './uploads/pdfs',
        filename: (req, file, callback) => {
          const uniqueName =
            Date.now() + '-' + Math.round(Math.random() * 1e9);
          callback(null, uniqueName + extname(file.originalname));
        },
      }),
    }),
  )
  async update(
    @Param('id', ParseIntPipe) id: number,
    @Body() dto: UpdateLessonDto,
    @UploadedFile() file?: Express.Multer.File,
  ) {
    const lesson = await this.lessonService.findOne(id);
    if (!lesson) throw new NotFoundException('Lesson not found');

    if (file) {
      dto.pdfUrl = `/uploads/pdfs/${file.filename}`;
    } else {
      dto.pdfUrl = lesson.pdfUrl;
    }

    return this.lessonService.update(id, dto);
  }

  // ================= DELETE =================
  @Delete(':id')
  @Roles(Role.ADMIN, Role.INSTRUCTOR)
  remove(@Param('id', ParseIntPipe) id: number) {
    return this.lessonService.remove(id);
  }
}