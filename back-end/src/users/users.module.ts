import { Module } from '@nestjs/common';
import { TypeOrmModule } from '@nestjs/typeorm';
import { UsersService } from './users.service';
import { UsersController } from './users.controller';
import { User } from './user.entity';
import { Course } from 'src/courses/course.entity';
import { Lesson } from 'src/lesson/lesson.entity';

@Module({
  imports: [TypeOrmModule.forFeature([User, Course, Lesson])],
  providers: [UsersService],
  controllers: [UsersController],
  exports: [UsersService],
})
export class UsersModule {}
