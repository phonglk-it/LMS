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

  async create(dto: CreateLessonDto) {
  const lesson = this.lessonRepo.create({
    title: dto.title,
    content: dto.content,
    order: dto.order,
    videoUrl: dto.videoUrl,
    pdfUrl: dto.pdfUrl,

    course: { id: dto.courseId },
  });

  return this.lessonRepo.save(lesson);
}

  async findByCourse(courseId: number) {
    return this.lessonRepo.find({
      where: { course: { id: courseId } },
      order: { id: 'ASC' },
    });
  }

  async findByCourseForStudent(courseId: number, userId: number) {
    const lessons = await this.lessonRepo.find({
      where: { course: { id: courseId } },
      order: { id: 'ASC' },
    });

    if (!lessons || lessons.length === 0) {
      throw new NotFoundException('Lessons not found');
    }

    const enrollment = await this.enrollmentRepo.findOne({
      where: {
        student: { id: userId },
        course: { id: courseId },
      },
    });

    const isPurchased = !!enrollment;

    const processedLessons = lessons.map((lesson, index) => {
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