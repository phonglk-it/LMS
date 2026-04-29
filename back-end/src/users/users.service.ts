// src/users/users.service.ts

import {
  Injectable,
  NotFoundException,
  BadRequestException,
} from '@nestjs/common';
import { InjectRepository } from '@nestjs/typeorm';
import { Repository } from 'typeorm';
import * as bcrypt from 'bcrypt';

import { User } from './user.entity';
import { Role } from './role.enum';
import { Course } from '../courses/course.entity';
import { Lesson } from '../lesson/lesson.entity';
import { ChangePasswordDto } from './dto/change-password.dto';

@Injectable()
export class UsersService {
  constructor(
    @InjectRepository(User)
    private readonly userRepository: Repository<User>,

    @InjectRepository(Course)
    private readonly courseRepository: Repository<Course>,

    @InjectRepository(Lesson)
    private readonly lessonRepository: Repository<Lesson>,
  ) {}


  async updateById(id: number, data: Partial<User>) {
    const user = await this.findById(id);
    if (!user) throw new NotFoundException('User not found');

    Object.assign(user, data);
    return this.userRepository.save(user);
  }

  async findAll(role?: Role) {
    if (role) {
      return this.userRepository.find({ where: { role } });
    }
    return this.userRepository.find();
  }

  async findById(id: number) {
    const user = await this.userRepository.findOne({
      where: { id },
    });
    if (!user) throw new NotFoundException('User not found');
    return user;
  }

  async findByEmail(email: string) {
    return this.userRepository.findOne({
      where: { email },
      select: ['id', 'email', 'password', 'fullName', 'role', 'avatar'],
    });
  }

  async create(data: {
    email: string;
    password: string;
    fullName: string;
    role?: Role;
  }) {
    const hashedPassword = await bcrypt.hash(data.password, 10);
    const user = this.userRepository.create({
      ...data,
      password: hashedPassword,
    });
    return this.userRepository.save(user);
  }

  async createInstructor(dto: any) {
    const hashedPassword = await bcrypt.hash(dto.password, 10);
    const instructor = this.userRepository.create({
      email: dto.email,
      password: hashedPassword,
      fullName: dto.fullName,
      role: Role.INSTRUCTOR,
    });
    return this.userRepository.save(instructor);
  }

  async deleteUser(id: number) {
    await this.userRepository.delete(id);
    return { message: 'User deleted' };
  }


  async getProfile(userId: number) {
    return this.userRepository.findOne({
      where: { id: userId },
    });
  }

  async uploadAvatar(userId: number, avatarPath: string) {
    const user = await this.findById(userId);
    user.avatar = avatarPath;
    return this.userRepository.save(user);
  }

  async changePassword(userId: number, dto: ChangePasswordDto) {
    const user = await this.userRepository.findOne({
      where: { id: userId },
      select: ['id', 'password'],
    });

    if (!user) throw new NotFoundException('User not found');

    const isMatch = await bcrypt.compare(dto.currentPassword, user.password);
    if (!isMatch) throw new BadRequestException('Current password is incorrect');

    const hashedPassword = await bcrypt.hash(dto.newPassword, 10);
    user.password = hashedPassword;

    await this.userRepository.save(user);
    return { message: 'Password changed successfully' };
  }

  async getProfileWithEnrollments(userId: number) {
    return this.userRepository.findOne({
      where: { id: userId },
      relations: ['enrollments', 'enrollments.course'],
    });
  }

  async findAllStudents() {
    return await this.userRepository.find({
      where: { role: Role.STUDENT },
    });
  }

  async findAllInstructors() {
    return await this.userRepository.find({
      where: { role: Role.INSTRUCTOR },
    });
  }


  async getSystemStats() {
    const [
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalCourses,
      totalLessons,
    ] = await Promise.all([
      this.userRepository.count({ where: { role: Role.STUDENT } }),
      this.userRepository.count({ where: { role: Role.INSTRUCTOR } }),
      this.userRepository.count({ where: { role: Role.ADMIN } }),
      this.courseRepository.count(),
      this.lessonRepository.count(),
    ]);

    return {
      totalStudents,
      totalInstructors,
      totalAdmins,
      totalCourses,
      totalLessons,
    };
  }
}