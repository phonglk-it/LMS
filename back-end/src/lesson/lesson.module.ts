import { Module } from "@nestjs/common";
import { TypeOrmModule } from "@nestjs/typeorm";
import { Lesson } from "./lesson.entity";
import { LessonService } from "./lesson.service";
import { LessonController } from "./lesson.controller";
import { Course } from "src/courses/course.entity";
import { Enrollment } from "src/enrollments/enrollment.entity";

@Module({
  imports: [
    TypeOrmModule.forFeature([Lesson, Course, Enrollment]),
  ],
  controllers: [LessonController],
  providers: [LessonService],
})
export class LessonModule {}
