import { Injectable, NotFoundException, ForbiddenException } from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import { Course } from './course.entity';
import { CreateCourseDto } from './dto/create-course.dto';
import { UpdateCourseDto } from './dto/update-course.dto';
import { UsersService } from '../users/users.service';
import { User } from '../users/user.entity';
import { Role } from '../users/role.enum';

@Injectable()
export class CoursesService {
  constructor(
    @InjectRepository(Course) private courseRepo: Repository<Course>,
    private usersService: UsersService,
  ) {}

  async findPublished() {
  return this.courseRepo.find({
    where: { isPublished: true }, 
    relations: ['instructor'],
  });
}

  async create(dto: CreateCourseDto) {
    let instructor: User | null = null;
    if (dto.instructorId) {
      instructor = await this.usersService.findById(dto.instructorId);
      if (!instructor) throw new NotFoundException('Instructor not found');
    }
    const course = this.courseRepo.create({ ...dto, instructor, isPublished: false });
    return this.courseRepo.save(course);
  }

  async findAll(currentUser: { userId: number; role: Role }) {
    if (currentUser.role === Role.ADMIN) return this.courseRepo.find({ relations: ['instructor'] });
    return this.courseRepo.find({
      where: { instructor: { id: currentUser.userId } },
      relations: ['instructor'],
    });
  }

  async findOne(id: number, currentUser: { userId: number; role: Role }) {
    const course = await this.courseRepo.findOne({ where: { id }, relations: ['instructor', 'lessons'] });
    if (!course) throw new NotFoundException('Course not found');
    if (currentUser.role === Role.INSTRUCTOR && course.instructor?.id !== currentUser.userId) {
      throw new ForbiddenException('Access denied');
    }
    return course;
  }

  async findOnePublic(id: number) {
    const course = await this.courseRepo.findOne({ where: { id } });
    if (!course) throw new NotFoundException('Course not found');
    return course;
  }

  async update(id: number, dto: UpdateCourseDto, currentUser: { userId: number; role: Role }) {
    const course = await this.findOne(id, currentUser);
    if (currentUser.role !== Role.ADMIN) throw new ForbiddenException('Only Admin can update');
    Object.assign(course, dto);
    return this.courseRepo.save(course);
  }

  async publish(id: number, currentUser: { userId: number; role: Role }) {
    const course = await this.findOne(id, currentUser);
    course.isPublished = true;
    return this.courseRepo.save(course);
  }

  async unpublish(id: number, currentUser: { userId: number; role: Role }) {
    const course = await this.findOne(id, currentUser);
    course.isPublished = false;
    return this.courseRepo.save(course);
  }

  async changeInstructor(courseId: number, instructorId: number) {
    const course = await this.courseRepo.findOne({ where: { id: courseId }, relations: ['instructor'] });
    if (!course) throw new NotFoundException('Course not found');
    const instructor = await this.usersService.findById(instructorId);
    if (!instructor || instructor.role !== Role.INSTRUCTOR) throw new NotFoundException('Instructor not found');
    course.instructor = instructor;
    return this.courseRepo.save(course);
  }

  async remove(id: number, currentUser: { userId: number; role: Role }) {
    const course = await this.findOne(id, currentUser);
    return this.courseRepo.remove(course);
  }
}