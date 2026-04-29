import { Injectable, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';

import { Lesson } from './lesson.entity';
import { CreateLessonDto } from './dto/create-lesson.dto';
import { UpdateLessonDto } from './dto/update-lesson.dto';

import { Enrollment } from '../enrollments/enrollment.entity';

@Injectable()
export class LessonService {
  constructor(
    @InjectRepository(Lesson)
    private lessonRepo: Repository<Lesson>,

    @InjectRepository(Enrollment)
    private enrollmentRepo: Repository<Enrollment>,
  ) {}

  // ================= CREATE =================
  async create(dto: CreateLessonDto) {
    const lesson = this.lessonRepo.create(dto);
    return this.lessonRepo.save(lesson);
  }

  // ================= ADMIN / INSTRUCTOR =================
  async findByCourse(courseId: number) {
    return this.lessonRepo.find({
      where: { course: { id: courseId } },
      order: { id: 'ASC' },
    });
  }

  // ================= STUDENT (PAYWALL LOGIC) =================
  async findByCourseForStudent(courseId: number, userId: number) {
    const lessons = await this.lessonRepo.find({
      where: { course: { id: courseId } },
      order: { id: 'ASC' },
    });

    if (!lessons || lessons.length === 0) {
      throw new NotFoundException('Lessons not found');
    }

    // Check enrollment (đã mua chưa)
    const enrollment = await this.enrollmentRepo.findOne({
      where: {
        student: { id: userId },
        course: { id: courseId },
      },
    });

    const isPurchased = !!enrollment;

    // 🔥 PAYWALL LOGIC CHUẨN
    const processedLessons = lessons.map((lesson, index) => {
      // CHƯA MUA → khóa từ bài 4 trở đi
      if (!isPurchased && index >= 3) {
        return {
          ...lesson,
          isLocked: true,
          videoUrl: null,
          pdfUrl: null,
          content:
            'This lesson is locked. Please purchase the course to continue.',
        };
      }

      // FREE hoặc đã mua
      return {
        ...lesson,
        isLocked: false,
      };
    });

    return {
      isPurchased,
      data: processedLessons,
    };
  }

  // ================= GET ONE =================
  async findOne(id: number) {
    const lesson = await this.lessonRepo.findOne({
      where: { id },
    });

    if (!lesson) {
      throw new NotFoundException('Lesson not found');
    }

    return lesson;
  }

  // ================= UPDATE =================
  async update(id: number, dto: UpdateLessonDto) {
    const lesson = await this.findOne(id);

    Object.assign(lesson, dto);
    return this.lessonRepo.save(lesson);
  }

  // ================= DELETE =================
  async remove(id: number) {
    const lesson = await this.findOne(id);
    return this.lessonRepo.remove(lesson);
  }
}