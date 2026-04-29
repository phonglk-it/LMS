import { Injectable, BadRequestException, NotFoundException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Enrollment } from './enrollment.entity';
import { CoursesService } from '../courses/courses.service';
import { UsersService } from '../users/users.service';
import { Role } from '../users/role.enum';

@Injectable()
export class EnrollmentsService {
  constructor(
    @InjectRepository(Enrollment) private enrollRepo: Repository<Enrollment>,
    private coursesService: CoursesService,
    private usersService: UsersService,
  ) {}


  async enrollAfterPayment(courseId: number, studentId: number) {
    const exists = await this.enrollRepo.findOne({
      where: { 
        student: { id: studentId }, 
        course: { id: courseId } 
      },
    });

    if (exists) {
      console.log(`[Enrollment] User ${studentId} already has access to course ${courseId}`);
      return exists;
    }

    console.log(`[Enrollment] Creating new access for user ${studentId} in course ${courseId}`);
    
    const course = await this.coursesService.findOnePublic(courseId);
    if (!course) throw new NotFoundException('Course not found');
    
    const student = await this.usersService.findById(studentId);
    if (!student) throw new NotFoundException('Student not found');

    return this.enrollRepo.save({ 
      student, 
      course,
      enrolledAt: new Date()
    });
  }

  async enroll(courseId: number, studentId: number) {
    const course = await this.coursesService.findOnePublic(courseId);
    if (!course.isPublished) throw new BadRequestException('Course is not published');

    const student = await this.usersService.findById(studentId);
    if (!student) throw new NotFoundException('Student not found');

    const exists = await this.enrollRepo.findOne({
      where: { student: { id: studentId }, course: { id: courseId } },
    });
    if (exists) throw new BadRequestException('Already enrolled');

    return this.enrollRepo.save({ student, course });
  }

  findMyCourses(studentId: number) {
    return this.enrollRepo.find({
      where: { student: { id: studentId } },
      relations: ['course', 'course.instructor'],
    });
  }

  async findStudentsOfCourse(courseId: number, currentUser: { userId: number; role: Role }) {
    const course = await this.coursesService.findOne(courseId, currentUser);
    return this.enrollRepo.find({
      where: { course: { id: course.id } },
      relations: ['student'],
    });
  }

  async unenroll(courseId: number, studentId: number) {
    const enrollment = await this.enrollRepo.findOne({
      where: { student: { id: studentId }, course: { id: courseId } },
    });
    if (!enrollment) throw new NotFoundException('Enrollment not found');
    
    return this.enrollRepo.remove(enrollment);
  }

    async findOne(courseId: number, studentId: number) {
    return this.enrollRepo.findOne({
      where: {
        course: { id: courseId },
        student: { id: studentId },
      },
    });
  }
}